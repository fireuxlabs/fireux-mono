export type FirebaseEcosystemClientConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
}

/**
 * Ecosystem-level Firebase client config.
 *
 * This template intentionally uses blank strings.
 * Populate from your Firebase Console (Project settings → Your apps).
 */
export const firebaseEcosystemTemplate = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
} as const satisfies FirebaseEcosystemClientConfig
