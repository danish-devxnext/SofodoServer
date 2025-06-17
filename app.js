const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const axios = require("axios");
const { Timestamp } = require("firebase-admin/firestore");
require('dotenv').config();

// For Railway ENV based serviceAccount config
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Add this early in your middleware chain
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let accessToken = null;

// Save FCM Token API
app.post('/api/save-fcm-token', async (req, res) => {
  const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken) return res.status(400).json({ message: 'Missing userId or fcmToken' });

  try {
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({ FCMToken: fcmToken });
    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ message: 'Failed to save FCM token' });
  }
});

// Refresh Google OAuth2 access token
async function refreshAccessToken() {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  try {
    const token = await auth.getAccessToken();
    accessToken = token;
    console.log("🔑 Access token refreshed.");
  } catch (error) {
    console.error("❌ Failed to refresh access token:", error);
  }
}

refreshAccessToken();
setInterval(refreshAccessToken, 1000 * 60 * 30);

// Firestore Listener
function setupNotificationsListener() {
  const db = admin.firestore();
  const notificationsRef = db.collection("notifications");

  // Get today's date range
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Convert to Firestore Timestamp
  const startTimestamp = Timestamp.fromDate(startOfDay);
  const endTimestamp = Timestamp.fromDate(endOfDay);

  // Apply query filter for today's createdAt
  notificationsRef
    .where("createdAt", ">=", startTimestamp)
    .where("createdAt", "<=", endTimestamp)
    .onSnapshot(async (snapshot) => {
      const addedDocs = snapshot.docChanges().filter(change => change.type === "added");
      if (addedDocs.length === 0) return;

      console.log(`📢 Found ${addedDocs.length} new notifications`);

      for (const change of addedDocs) {
        const notificationData = change.doc.data();
        const { targetId, type, message } = notificationData;

        if (!Array.isArray(targetId)) {
          console.error("❌ targetId is not an array:", targetId);
          continue;
        }

        for (const userId of targetId) {
          await processUserNotification(userId, type, message);
        }
      }
    }, (error) => {
      console.error("❌ Firestore listener error:", error);
    });
}
async function processUserNotification(userId, notificationType, message) {
  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.error(`❌ User not found: ${userId}`);
      return;
    }

    const userData = userSnap.data();
    const { FCMToken, notifications } = userData;

    if (!FCMToken) {
      console.error(`❌ No FCM token for user: ${userId}`);
      return;
    }

    if (!notifications || notifications[notificationType] !== true) {
      console.log(`⚠️ ${notificationType} notification disabled for user: ${userId}`);
      return;
    }

    await sendNotificationViaFCM(FCMToken, notificationType, message);
  } catch (err) {
    console.error(`❌ Error processing user ${userId}:`, err);
  }
}

async function sendNotificationViaFCM(fcmToken, title, body) {
  if (!accessToken) {
    console.error("❌ No access token available.");
    return;
  }

  const url = `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`;
  const payload = {
    message: {
      token: fcmToken,
      notification: { title, body },
      android: { priority: "high" },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: "default",
            contentAvailable: true,
          },
        },
      },
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    console.log("✅ Notification sent:", response.data);
  } catch (error) {
    console.error("❌ Error sending notification:", error.response?.data || error.message);
  }
}

setupNotificationsListener();

app.get("/", (req, res) => {
  res.send("FCM Notification Server Running 🚀");
});

app.listen(port, () => {
  console.log(`🚀 Server running at port ${port}`);
});
