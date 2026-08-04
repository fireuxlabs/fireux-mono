import type { FirebaseTimestamp } from '../../../types/firebase'

export interface FireuxCreatedStamp {
  at: FirebaseTimestamp
  by?: string
  app_id?: string
}

export interface FireuxUpdatedStamp {
  at: FirebaseTimestamp
  by?: string
}

export interface FireuxStamps {
  created: FireuxCreatedStamp
  updated: FireuxUpdatedStamp
}

export type FireuxStamped = FireuxStamps

/** Transitional shape for stored records that have not migrated to nested stamps. */
export interface FireuxLegacyStamped {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  creator_id?: string
  app_id?: string
}
