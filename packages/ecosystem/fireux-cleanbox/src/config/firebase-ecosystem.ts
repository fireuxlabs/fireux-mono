export const firebaseEcosystem = {
  apiKey: process.env.NUXT_FIREBASE_API_KEY as string,
  authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NUXT_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID as string,
} as const
