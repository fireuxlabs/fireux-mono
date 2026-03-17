// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
/**
 * Entity Class: Dual-Layer
 * Core Path: /chefs/<userId>
 * App Path: /apps/<appId>/chefs/<userId>
 */

export const ChefCore = {
  id: '' as string,

  // Chef (scoped, v1)
  title: '' as string,
  summary: '' as string,
  chef_bio: '' as string,
  chef_image: '' as string,

  // Chef descriptors (scoped)
  chef_signature_dishes: [] as string[],
  kitchen_ids: [] as string[],

  // Optional org label (scoped)
  chef_organization_name: '' as string,

  // Deprecated fields retained temporarily for migration compatibility.
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],
  bio_long: '' as string,
  specialties: [] as string[],
  locations: [] as string[],
  organization_name: '' as string,

  // Stamps
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type ChefCore = {
  [K in keyof typeof ChefCore]: (typeof ChefCore)[K]
}

export const ChefApp = {
  id: '' as string,

  // Stamps
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type ChefApp = {
  [K in keyof typeof ChefApp]: (typeof ChefApp)[K]
}
