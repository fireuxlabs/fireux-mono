import * as admin from 'firebase-admin'

// Guarded singleton accessor for firebase-admin
export function getAdmin() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      })
    } catch {
      // In case of race during dev HMR, ignore
    }
  }
  return admin
}
