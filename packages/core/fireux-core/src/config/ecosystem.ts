import type { FirebaseProjectConfig } from './schemas/firebase-project'

export type FireuxEcosystemConfig = {
  id: string
  name: string
  description: string

  /** Shared Firebase project (public, same for all apps in ecosystem) */
  firebase: FirebaseProjectConfig
}