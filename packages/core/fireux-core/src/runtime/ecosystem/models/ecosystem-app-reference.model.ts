import type { FirebaseTimestamp } from '../../../types/firebase'

export const ECOSYSTEM_APP_REFERENCE_PATH =
  'ecosystems/{ecosystemId}/apps/{appId}' as const

/** Minimal locator for an App whose root may live in another database. */
export type EcosystemAppReference = {
  app_id: string
  database_id: string
  created: { at: FirebaseTimestamp }
  updated: { at: FirebaseTimestamp }
}
