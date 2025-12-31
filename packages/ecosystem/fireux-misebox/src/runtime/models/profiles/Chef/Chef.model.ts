import type {
  AppProfileBase,
  CoreProfileBase,
} from 'fireux-core/runtime/models/core/profile.model'
import { chefConfig } from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  chefs/{uid}
 * App doc:   apps/{appId}/chefs/{uid}
 */

export interface ChefCore extends CoreProfileBase {
  tagline: string
  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  avatar: string
  avatar_url: string
  organization_name: string
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface ChefApp extends AppProfileBase {}

export { chefConfig }

