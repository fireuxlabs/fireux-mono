import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import type { Pill as PillModel } from 'fireux-core/types/pill.model'
import { chefConfig } from './supporting'

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
    id?: string
    bio_short?: string | null
    specialties?: string[]
    locations?: string[]
  }

  /** Full CORE profile surface */
  export interface ProfileCore extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    tagline?: string | null
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
    tagline?: string | null
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
const routeFor = (id?: string | null) =>
  id ? `/${chefConfig.collectionName}/${id}` : undefined

export const resolveChefCell = (
  profile?: ChefProfile | null,
  fallbackId = 'chef-profile'
): ChefCard.Cell | null => {
  if (!profile) return null

  const user = profile.user ?? undefined

  const id = profile.id ?? user?.id ?? fallbackId

  const subtitle = profile.subtitle ?? null
  const tagline = profile.tagline ?? null

  return {
    id,
    avatar: user?.avatar ?? undefined,
    title: user?.display_name ?? profile.title ?? 'Chef',
    subtitle,
    tagline,
    badges: profile.badges ?? [],
    bio_short: profile.bio_short ?? null,
    specialties: profile.specialties ?? [],
    locations: profile.locations ?? [],
    to: routeFor(profile.id),
  }
}

export { chefConfig }
