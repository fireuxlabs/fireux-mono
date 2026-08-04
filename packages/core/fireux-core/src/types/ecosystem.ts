export type FireuxEcosystemConfig = {
  id: string
  name: string
  description: string

  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    databaseId?: string
    identityDatabaseId?: string
    simulationDatabaseId?: string
  }

  /** Shared Firebase SSR deployment identity for every App in this ecosystem. */
  ssr: {
    region: string
    serviceAccount?: string
  }
}
