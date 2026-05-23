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

  /**
   * Standard SSR region for all apps in this ecosystem (e.g., 'europe-west1')
   */
  ssrRegion?: string
}
