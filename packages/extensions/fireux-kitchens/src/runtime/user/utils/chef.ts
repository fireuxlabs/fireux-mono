import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Chef } from '../models/chef.model'

export type * from '../models/chef.model'
export const ChefStorage = { shape: 'user-owned', path: 'users/{userId}/profiles/chef', collection: 'profiles', document: 'chef', idParam: 'userId' } as const
export const CHEF_GALLERY_MAX_ITEMS = 6
export const ChefDefaults: Chef = { id: '', kind: 'chef', title: '', summary: '', chef_bio: '', chef_image: '', chef_signature_dishes: [], chef_gallery: [], chef_organization_name: '', created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'] }, updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] } }
export type ChefProfile = Omit<Chef, 'created' | 'updated'>
export type ChefProfilePayload = Omit<ChefProfile, 'id'>
export type ChefDirectoryProfilePayload = Pick<ChefProfilePayload, 'title' | 'summary' | 'chef_bio' | 'chef_image'>
export type ChefDirectoryProfile = ChefDirectoryProfilePayload & Pick<ChefProfile, 'id'>
export type ChefCreateInput = Omit<Chef, 'id' | 'created' | 'updated'>
export type ChefUpdateInput = Partial<Omit<Chef, 'id' | 'created' | 'updated'>>
export function createChefProfileSeed(): ChefCreateInput { const { id: _id, created: _created, updated: _updated, ...seed } = ChefDefaults; return { ...seed, chef_signature_dishes: [], chef_gallery: [] } }
