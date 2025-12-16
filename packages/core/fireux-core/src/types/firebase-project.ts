export type FirebaseProjectConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string

  /** Optional: name/id of the Firestore DB used for registry data. */
  registryDatabaseId?: string
}
