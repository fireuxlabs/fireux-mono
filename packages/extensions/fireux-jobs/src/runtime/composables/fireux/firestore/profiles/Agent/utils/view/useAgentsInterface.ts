// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentsInterface.ts

import type { User } from 'fireux-core/runtime/models/core/user.model'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model'
import type { AgentCard } from './useAgentInterface'

type UserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type AgentDirectoryEntry = AgentCore & { user?: User | UserSummary }

export function useAgentsInterface() {
  function safeArray<T>(input: unknown): T[] {
    return Array.isArray(input) ? (input as T[]) : []
  }

  function safeString(input: unknown): string {
    return typeof input === 'string' ? input : ''
  }

  function resolveBadges(currentProfile: AgentCore): string[] {
    const tags = safeArray<unknown>((currentProfile as any)?.tags)
      .filter((x) => typeof x === 'string') as string[]
    if (tags.length) return tags

    const legacy = safeArray<unknown>((currentProfile as any)?.badges)
      .filter((x) => typeof x === 'string') as string[]
    return legacy
  }

  function card(entry: AgentDirectoryEntry): AgentCard.Card {
    const title = safeString((entry as any)?.title)
    const subtitle = safeString((entry as any)?.subtitle)
    const tagline = safeString((entry as any)?.tagline)

    // Canonical: directory cards are user-hydrated; no title fallback for display name.
    const displayName = safeString((entry.user as any)?.display_name)

    return {
      id: entry.id,
      to: `/${agentConfig.collectionName}/${entry.id}`,

      avatarUrl: safeString((entry.user as any)?.avatar),

      displayName,
      tagline: tagline || title || subtitle,
      badges: resolveBadges(entry),

      bioShort: safeString((entry as any)?.bio_short),

      // IMPORTANT: only render contactEmail on authorized UI surfaces.
      contactEmail: safeString((entry as any)?.contact_email).trim(),
      contactPhone: safeString((entry as any)?.contact_phone).trim(),
      websiteUrl: safeString((entry as any)?.website_url),
    }
  }

  function searchText(entry: AgentDirectoryEntry): string {
    const displayName = safeString((entry.user as any)?.display_name)
    const title = safeString((entry as any)?.title)
    const tagline = safeString((entry as any)?.tagline)
    return `${displayName} ${title} ${tagline} ${entry.id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
