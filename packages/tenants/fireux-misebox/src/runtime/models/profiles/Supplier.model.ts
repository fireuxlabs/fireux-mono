import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'

/** Unified Supplier wrapper (core + app overlays) */
export interface Supplier {
  id: string
  display_name?: string
  avatar?: string
  core: SupplierCoreProfile | null
  app?: SupplierAppProfile | null
}

/**
 * Card + domain shapes (mirrors Chef)
 * - ProfileCore/App host the domain fields for delta-friendly overlays
 */
export namespace SupplierCard {
  /** Pill shape */
  export interface Pill extends PillModel.Props {}

  /** Cell shape */
  export interface Cell extends Pill {
    id: string
    bio_short?: string | null
    specialties?: string[]
    categories?: string[]
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
  }
}

/**
 * Firestore-facing profile types
 * - Core profile == UI ProfileCore
 * - App profile == UI ProfileApp
 * - SupplierProfile used when a generic profile type is needed
 */
export type SupplierProfile = SupplierCard.ProfileCore
export type SupplierCoreProfile = SupplierCard.ProfileCore
export type SupplierAppProfile = SupplierCard.ProfileApp

/** Config */
export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  cta: 'Create your Supplier profile to appear in listings.',
} as const
