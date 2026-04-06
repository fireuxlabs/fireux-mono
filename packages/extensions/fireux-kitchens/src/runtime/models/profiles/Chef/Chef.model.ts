// FILE: packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Identity
 * Storage: root canonical record plus app overlay
 * Root path: /chefs/<userId>
 * Overlay path: /apps/<appId>/chefs/<userId>
 *
 * Decision note:
 * - Chef is an identity profile first, with app-scoped stored truth only where real operational state exists.
 * - The overlay should stay small until a concrete app need justifies more.
 * - If that changes later, update the models README first, then this file.
 */

export const ChefModel = {
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

export type Chef = {
  [K in keyof typeof ChefModel]: (typeof ChefModel)[K]
}

// Compatibility aliases retained while call sites are still being migrated.
export const ChefCore = ChefModel
export type ChefCore = Chef

export const AppChefModel = {
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

export type AppChef = {
  [K in keyof typeof AppChefModel]: (typeof AppChefModel)[K]
}

// Compatibility aliases retained while call sites are still being migrated.
export const ChefApp = AppChefModel
export type ChefApp = AppChef

export type ChefCreateInput = Omit<Chef, 'id' | 'created' | 'updated'>
export type ChefUpdateInput = Partial<Omit<Chef, 'id' | 'created' | 'updated'>>
