// FILE: packages/extensions/fireux-kitchens/src/runtime/user/models/chef.model.ts
// User-owned Chef profile and directory shapes.

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type ChefGalleryItem = {
  name: string
  image_url: string
}

export type Chef = FireuxStamped & {
  /** Reader-supplied parent User uid; never stored in the profile record. */
  id: string
  kind: 'chef'
  title: string
  summary: string
  chef_bio: string
  /** Chef-owned editorial media, distinct from the canonical User avatar. */
  chef_image: string
  chef_signature_dishes: string[]
  chef_gallery: ChefGalleryItem[]
  chef_organization_name: string
}

/**
 * Runtime models canon: docs/ai/gpt-context.md
 *
 * Family: Identity
 * Storage: User-owned profile
 * Path: /users/<userId>/profiles/chef
 *
 * Decision note:
 * - Chef is a User-owned capability/profile record.
 * - Kitchen authority is derived from Kitchen Team, never an inverse profile array.
 */
export const ChefStorage = {
  shape: 'user-owned',
  path: 'users/{userId}/profiles/chef',
  collection: 'profiles',
  document: 'chef',
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
  workspace: false,
  parent: 'User',
  scoped: ChefStorage.path,
  notes: [
    'User owns person identity; ChefProfile owns only Chef capability and presentation.',
    'The same uid joins User and ChefProfile.',
    'Kitchen membership is resolved from Kitchen Team and is never indexed on ChefProfile.',
  ],
})

export const ChefDefaults = {
  id: '' as string,
  kind: 'chef' as const,

  // Chef (scoped, v1)
  title: '' as string,
  summary: '' as string,
  chef_bio: '' as string,
  chef_image: '' as string,

  // Chef descriptors (scoped)
  chef_signature_dishes: [] as string[],
  chef_gallery: [] as ChefGalleryItem[],

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

export type ChefProfile = Omit<Chef, 'created' | 'updated'>
export type ChefProfilePayload = Omit<ChefProfile, 'id'>
export type ChefDirectoryProfilePayload = Pick<
  ChefProfilePayload,
  'title' | 'summary' | 'chef_bio' | 'chef_image'
>
export type ChefDirectoryProfile = ChefDirectoryProfilePayload &
  Pick<ChefProfile, 'id'>

export type ChefCreateInput = Omit<Chef, 'id' | 'created' | 'updated'>
export type ChefUpdateInput = Partial<Omit<Chef, 'id' | 'created' | 'updated'>>

export function createChefProfileSeed(): ChefCreateInput {
  return {
    title: ChefDefaults.title,
    kind: ChefDefaults.kind,
    summary: ChefDefaults.summary,
    chef_bio: ChefDefaults.chef_bio,
    chef_image: ChefDefaults.chef_image,
    chef_signature_dishes: [...ChefDefaults.chef_signature_dishes],
    chef_gallery: [...ChefDefaults.chef_gallery],
    chef_organization_name: ChefDefaults.chef_organization_name,
  }
}
