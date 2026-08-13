// FILE: packages/extensions/fireux-kitchens/src/runtime/models/chef.model.ts
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: own exact storage, provision, and public detail/directory shapes.

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { AppProfileBase } from 'fireux-core/runtime/models/utils/profile.model'
import { AppProfileStamps } from 'fireux-core/runtime/models/utils/profile.model'
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type ChefGalleryItem = {
  name: string
  image_url: string
}

export type Chef = FireuxStamped & {
  id: string
  title: string
  summary: string
  chef_bio: string
  chef_image: string
  chef_signature_dishes: string[]
  chef_gallery: ChefGalleryItem[]
  kitchen_ids: string[]
  chef_organization_name: string
}

export type AppChef = AppProfileBase

/**
 * Runtime models canon: docs/ai/gpt-context.md
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

/** Product cap mirrored by the authoritative Firestore Rules validator. */
export const CHEF_GALLERY_MAX_ITEMS = 6

export const ChefProfileRecord = defineFireuxEntity({
  kind: 'record',
  name: 'ChefProfile',
  family: ['identity', 'profile', 'kitchen'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'projection',
  console: false,
  parent: 'User',
  scoped: ChefStorage.root,
  notes: [
    'User owns person identity; ChefProfile owns only Chef capability and presentation.',
    'The same uid joins User and ChefProfile.',
  ],
})

export const AppChefProfileRecord = defineFireuxEntity({
  kind: 'record',
  name: 'AppChefProfile',
  family: ['identity', 'profile', 'kitchen'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  console: false,
  parent: 'User',
  scoped: AppChefStorage.path,
  notes: ['AppChefProfile is a non-identity App delta for one ChefProfile uid.'],
})

export const ChefDefaults = {
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
} as const satisfies Chef

export type PublicChefProfile = Omit<Chef, 'created' | 'updated'>
export type PublicChefProfilePayload = Omit<PublicChefProfile, 'id'>
export type PublicChefDirectoryProfilePayload = Pick<
  PublicChefProfilePayload,
  'title' | 'summary' | 'chef_bio' | 'chef_image'
>
export type PublicChefDirectoryProfile = PublicChefDirectoryProfilePayload &
  Pick<PublicChefProfile, 'id'>

export const AppChefDefaults = {
  id: '' as string,

  // Stamps
  ...AppProfileStamps,
} as const satisfies AppChef

export type ChefCreateInput = Omit<Chef, 'id' | 'created' | 'updated'>
export type ChefUpdateInput = Partial<Omit<Chef, 'id' | 'created' | 'updated'>>

export function createChefProfileSeed(): ChefCreateInput {
  return {
    title: ChefDefaults.title,
    summary: ChefDefaults.summary,
    chef_bio: ChefDefaults.chef_bio,
    chef_image: ChefDefaults.chef_image,
    chef_signature_dishes: [...ChefDefaults.chef_signature_dishes],
    chef_gallery: [...ChefDefaults.chef_gallery],
    kitchen_ids: [...ChefDefaults.kitchen_ids],
    chef_organization_name: ChefDefaults.chef_organization_name,
  }
}
