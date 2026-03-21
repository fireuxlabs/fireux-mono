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
