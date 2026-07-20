// FILE: packages/extensions/fireux-kitchens/src/runtime/models/chef.model.ts
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: own exact storage, provision, and public detail/directory shapes.

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { AppProfileBase } from 'fireux-core/runtime/models/core/profile.model.ts'
import { AppProfileStamps } from 'fireux-core/runtime/models/core/profile.model.ts'
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
export const ChefStorage = {
  shape: 'both',
  root: 'chefs/{userId}',
  overlay: 'apps/{appId}/chefs/{userId}',
  rootCollection: 'chefs',
  overlayCollection: 'chefs',
  idParam: 'userId',
} as const

export const AppChefStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/chefs/{userId}',
  collection: 'chefs',
  parent: 'app',
  idParam: 'userId',
} as const

export type ChefGalleryItem = {
  name: string
  image_url: string
}

/** Product cap mirrored by the authoritative Firestore Rules validator. */
export const CHEF_GALLERY_MAX_ITEMS = 6

export const ChefModel = {
  id: '' as string,

  // Chef (scoped, v1)
  title: '' as string,
  summary: '' as string,
  chef_bio: '' as string,
  chef_image: '' as string,

  // Chef descriptors (scoped)
  chef_signature_dishes: [] as string[],
  chef_gallery: [] as ChefGalleryItem[],
  kitchen_ids: [] as string[],

  // Optional org label (scoped)
  chef_organization_name: '' as string,

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

export type PublicChefProfile = Omit<Chef, 'created' | 'updated'>
export type PublicChefProfilePayload = Omit<PublicChefProfile, 'id'>
export type PublicChefDirectoryProfilePayload = Pick<
  PublicChefProfilePayload,
  'title' | 'summary' | 'chef_bio' | 'chef_image'
>
export type PublicChefDirectoryProfile = PublicChefDirectoryProfilePayload &
  Pick<PublicChefProfile, 'id'>

export const AppChefModel = {
  id: '' as string,

  // Stamps
  ...AppProfileStamps,
} as const

export type AppChef = AppProfileBase

export type ChefCreateInput = Omit<Chef, 'id' | 'created' | 'updated'>
export type ChefUpdateInput = Partial<Omit<Chef, 'id' | 'created' | 'updated'>>

export function createChefProfileSeed(): ChefCreateInput {
  return {
    title: ChefModel.title,
    summary: ChefModel.summary,
    chef_bio: ChefModel.chef_bio,
    chef_image: ChefModel.chef_image,
    chef_signature_dishes: [...ChefModel.chef_signature_dishes],
    chef_gallery: [...ChefModel.chef_gallery],
    kitchen_ids: [...ChefModel.kitchen_ids],
    chef_organization_name: ChefModel.chef_organization_name,
  }
}
