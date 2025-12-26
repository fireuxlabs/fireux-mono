import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import type { Pill as PillModel } from 'fireux-core/types/pill.model'
import { supplierConfig } from './Supplier/supporting'

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
  export interface Pill extends PillModel.Props {
    company_name?: string | null
    company_avatar?: string | null
  }

  /** Cell shape */
  export interface Cell extends Pill {
    id?: string
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
    organization_name?: string | null
    subtitle?: string | null
    tagline?: string | null
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
    organization_name?: string | null
    subtitle?: string | null
    tagline?: string | null
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
const routeFor = (id?: string | null) =>
  id ? `/${supplierConfig.collectionName}/${id}` : undefined

export const resolveSupplierCell = (
  profile?: SupplierProfile | null,
  fallbackId = 'supplier-profile'
): SupplierCard.Cell | null => {
  if (!profile) return null

  const user = profile.user ?? undefined

  const id = profile.id ?? user?.id ?? fallbackId

  const subtitle = profile.subtitle ?? null
  const tagline = profile.tagline ?? null

  const companyAvatar =
    profile.avatar ?? profile.avatar_url ?? user?.avatar ?? undefined

  const companyName =
    profile.organization_name ??
    profile.title ??
    user?.display_name ??
    'Supplier'

  return {
    id,
    avatar: user?.avatar ?? undefined,
    title: user?.display_name ?? profile.title ?? 'Supplier',
    subtitle,
    tagline,
    badges: profile.badges ?? [],
    bio_short: profile.bio_short ?? null,
    specialties: profile.specialties ?? [],
    categories: profile.categories ?? [],
    company_name: companyName,
    company_avatar: companyAvatar,
    to: routeFor(profile.id),
  }
}

export { supplierConfig }
