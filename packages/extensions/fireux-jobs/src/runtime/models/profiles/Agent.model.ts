import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'
import { agentConfig } from './Agent/supporting'

/** Unified Agent wrapper (core + app overlays) */
export interface Agent {
  id: string
  creator_id?: string
  display_name?: string
  avatar?: string
  core: AgentCoreProfile | null
  app?: AgentAppProfile | null
}

/**
 * Card + domain shapes
 * - All “profile fields” live inside ProfileCore / ProfileApp
 * - Core/App remain delta-friendly
 */
export namespace AgentCard {
  /** Pill shape */
  export interface Pill extends PillModel.Props {}

  /** Cell shape */
  export interface Cell extends Pill {
    id?: string
    creator_id?: string | null
  }

  /** Full CORE profile surface */
  export interface ProfileCore extends Cell {
    creator_id?: string | null
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
  }

  /** Tenant APP overlay (delta space) */
  export interface ProfileApp extends ProfileCore {}
}

/**
 * Firestore-facing profile types
 * - Core profile == UI ProfileCore
 * - App profile == UI ProfileApp
 * - AgentProfile used when a generic profile type is needed
 */
export type AgentProfile = AgentCard.ProfileCore
export type AgentCoreProfile = AgentCard.ProfileCore
export type AgentAppProfile = AgentCard.ProfileApp

/** Config */
const routeFor = (id?: string | null) =>
  id ? `/${agentConfig.collectionName}/${id}` : undefined

export const resolveAgentCell = (
  profile?: AgentProfile | null,
  fallbackId = 'agent-profile'
): AgentCard.Cell | null => {
  if (!profile) return null

  const user = profile.user ?? undefined

  const id = profile.id ?? profile.creator_id ?? user?.id ?? fallbackId

  const displayName = user?.display_name ?? 'Agent'

  const tagline =
    (profile as { tagline?: string | null } | null)?.tagline ??
    (profile as { subtitle?: string | null } | null)?.subtitle ??
    ''

  return {
    id,
    creator_id: profile.creator_id ?? null,
    avatar: user?.avatar ?? undefined,
    title: displayName,
    subtitle: tagline,
    tagline,
    badges: [],
    to: routeFor(id),
  }
}

export const resolveAgentPill = (
  profile?: AgentProfile | null
): AgentCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? 'Agent',
  subtitle: (profile as { subtitle?: string | null } | null)?.subtitle ?? '',
  tagline: (profile as { tagline?: string | null } | null)?.tagline ?? '',
  badges: [],
  to: routeFor(profile?.id ?? profile?.creator_id ?? null),
})

export const resolveAgentPillKey = (pill: AgentCard.Pill) =>
  pill.to ?? pill.title ?? 'agent'

export { agentConfig }
