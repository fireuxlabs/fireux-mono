import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

export function admin() {
  if (
    process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:18744' ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:19099'
  )
    throw new Error('This fixture requires its local emulators.')
  const app =
    getApps()[0] ?? initializeApp({ projectId: 'demo-native-foundation' })
  return { db: getFirestore(app, 'probe'), auth: getAuth(app) }
}
