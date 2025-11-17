import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'

/** Unified Chef wrapper (core + app overlays) */
export interface Chef {
  id: string
  display_name?: string
  avatar?: string
  core: ChefCoreProfile | null
  app?: ChefAppProfile | null
}

/**
 * Card + domain shapes
 * - All “profile fields” live inside ProfileCore / ProfileApp
 * - Core/App remain delta-friendly
 */
export namespace ChefCard {
  /** Pill shape */
  export interface Pill extends PillModel.Props {}

  /** Cell shape */
  export interface Cell extends Pill {
    id: string
    bio_short?: string | null
    specialties?: string[]
  }

  /** Full CORE profile surface */
  export interface ProfileCore extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    badges?: string[]
    bio_long?: string | null
    avatar?: string | null
    avatar_url?: string | null
    organization_name?: string | null
    locations?: string[]
  }

  /** Tenant APP overlay (delta space) */
  export interface ProfileApp extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    badges?: string[]
    bio_long?: string | null
    organization_name?: string | null
    locations?: string[]
  }
}

/**
 * Firestore-facing profile types
 * - Core profile == UI ProfileCore
 * - App profile == UI ProfileApp
 * - ChefProfile used when a generic profile type is needed
 */
export type ChefProfile = ChefCard.ProfileCore
export type ChefCoreProfile = ChefCard.ProfileCore
export type ChefAppProfile = ChefCard.ProfileApp

/** Config */
export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  cta: 'Create your Chef profile to appear in listings.',
} as const
