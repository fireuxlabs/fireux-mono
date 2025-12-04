import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'
import { agentConfig } from './supporting'

/** Unified Agent wrapper (core + app overlays) */
export interface Agent {
	id: string
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
		/** @deprecated use tagline */
		subtitle?: string | null
		tagline?: string | null
		badges?: string[]
		bio_long?: string | null
		avatar?: string | null
		avatar_url?: string | null
		organization_name?: string | null
	}

	/** Tenant APP overlay (delta space) */
	export interface ProfileApp extends Cell {
		user?: Profile['user']
		domain?: Profile['domain']
		created_at?: Profile['created_at']
		updated_at?: Profile['updated_at']
		title?: string | null
		/** @deprecated use tagline */
		subtitle?: string | null
		tagline?: string | null
		bio_short?: string | null
		specialties?: string[]
		locations?: string[]
	}
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

	const id = profile.id ?? user?.id ?? fallbackId

	const tagline =
		profile.tagline ?? (profile as { subtitle?: string | null })?.subtitle ?? ''

	return {
		id,
		avatar: user?.avatar ?? undefined,
		title: user?.display_name ?? profile.title ?? 'Agent',
		subtitle: tagline,
		tagline,
		badges: profile.badges ?? [],
		bio_short: profile.bio_short ?? null,
		specialties: profile.specialties ?? [],
		locations: profile.locations ?? [],
		to: routeFor(profile.id),
	}
}

export const resolveAgentPill = (
	profile?: AgentProfile | null
): AgentCard.Pill => ({
	avatar: profile?.user?.avatar ?? '',
	title: profile?.user?.display_name ?? '',
	subtitle:
		profile?.tagline ??
		(profile as { subtitle?: string | null } | null)?.subtitle ??
		'',
	tagline:
		profile?.tagline ??
		(profile as { subtitle?: string | null } | null)?.subtitle ??
		'',
	badges: [],
	to: routeFor(profile?.id),
})

export const resolveAgentPillKey = (pill: AgentCard.Pill) =>
	pill.to ?? pill.title ?? 'agent'

export { agentConfig }
