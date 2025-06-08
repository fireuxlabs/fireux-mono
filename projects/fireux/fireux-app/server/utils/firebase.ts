import admin from 'firebase-admin'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Automatically loads GOOGLE_APPLICATION_CREDENTIALS
  })
  console.log('✅ Firebase Admin initialized.')
}

export default admin
