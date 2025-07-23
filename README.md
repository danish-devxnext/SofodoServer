# SofodoServer

A Node.js/Express.js server for handling Firebase Cloud Messaging (FCM) push notifications for the Sofodo mobile application.

##  Features

- **Firebase Integration**: Uses Firebase Admin SDK for authentication and Firestore database
- **FCM Token Management**: Stores and manages user FCM tokens for push notifications
- **Real-time Notifications**: Firestore listener for instant notification processing
- **Google OAuth2**: Automatic token refresh for Firebase Messaging API
- **User Preferences**: Respects individual user notification settings
- **Cross-platform Support**: Handles both Android and iOS push notifications
- **Health Monitoring**: Built-in health check endpoints

##  Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore database
- Google Cloud Platform account

##  Installation

1. **Clone the repository**
   `ash
   git clone https://github.com/danish-devxnext/SofodoServer.git
   cd SofodoServer
   `

2. **Install dependencies**
   `ash
   npm install
   `

3. **Environment Setup**
   Create a .env file in the root directory with the following variables:
   `env
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   `

4. **Firebase Configuration**
   - Set up a Firebase project
   - Enable Firestore database
   - Create a service account and download the credentials
   - Enable Firebase Cloud Messaging

##  Usage

### Development
`ash
npm run dev
`

### Production
`ash
npm start
`

The server will start on the default port (usually 3000).

##  API Endpoints

### Health Check
- **GET** /health - Server health status
- **GET** / - Server status message

### FCM Token Management
- **POST** /api/save-fcm-token
  - **Body**: { "userId": "string", "fcmToken": "string" }
  - **Purpose**: Save user's FCM token to Firestore

##  Project Structure

`
SofodoServer/
 app.js              # Main server application
 package.json        # Dependencies and scripts
 .gitignore          # Git ignore rules
 routes/             # Express routes
    index.js        # Basic routes
    users.js        # User-related routes
 views/              # Jade templates
    index.jade      # Main view
    error.jade      # Error page
 public/             # Static files
     stylesheets/    # CSS files
`

##  Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore database
3. Create a service account
4. Download service account key
5. Add credentials to .env file

### Environment Variables
- FIREBASE_TYPE: Service account type
- FIREBASE_PROJECT_ID: Your Firebase project ID
- FIREBASE_PRIVATE_KEY_ID: Private key ID from service account
- FIREBASE_PRIVATE_KEY: Private key from service account
- FIREBASE_CLIENT_EMAIL: Client email from service account

##  Mobile App Integration

The server is designed to work with mobile applications that:
1. Register for FCM tokens
2. Send tokens to the server via /api/save-fcm-token
3. Configure user notification preferences in Firestore
4. Receive push notifications based on user settings

##  Real-time Features

- **Firestore Listener**: Monitors notifications collection for new entries
- **Token Refresh**: Automatically refreshes Google OAuth2 tokens every 30 minutes
- **User Preferences**: Checks user notification settings before sending

##  Security

- Environment variables for sensitive data
- Firebase Admin SDK for secure authentication
- CORS enabled for cross-origin requests
- Input validation for API endpoints

##  Dependencies

### Core Dependencies
- express: Web framework
- irebase-admin: Firebase Admin SDK
- googleapis: Google APIs client
- xios: HTTP client
- cors: Cross-origin resource sharing
- dotenv: Environment variables

### Development Dependencies
- 
odemon: Auto-restart on file changes

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

##  License

This project is licensed under the MIT License.

##  Authors

- **Danish Dev** - *Initial work* - [danish-devxnext](https://github.com/danish-devxnext)

##  Acknowledgments

- Firebase team for the excellent documentation
- Express.js community for the robust framework
- Google Cloud Platform for the infrastructure

---

**Note**: Make sure to configure your Firebase project and environment variables before running the server.
