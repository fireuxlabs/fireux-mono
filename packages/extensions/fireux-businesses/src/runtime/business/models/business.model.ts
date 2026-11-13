import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FireuxEntityManagement } from 'fireux-core/runtime/types/entity-management'

export type BusinessStamp = {
  at: FirebaseTimestamp
  by?: string
  app_id?: string
}

/** Business identity is independent of its optional physical locations. */
export type Business = {
  id: string
  name: string
  description: string
  email: string
  phone: string
  website: string
  place_ids: string[]
  management: FireuxEntityManagement
  created: BusinessStamp
  updated: BusinessStamp
}
