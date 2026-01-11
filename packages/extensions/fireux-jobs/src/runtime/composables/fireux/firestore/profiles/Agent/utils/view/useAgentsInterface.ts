// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentsInterface.ts

import type { User } from 'fireux-core/runtime/models/core/user.model'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model'
import type { AgentCard } from './useAgentInterface'

type UserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type AgentDirectoryEntry = AgentCore & { user?: User | UserSummary }

export function useAgentsInterface() {
  function resolveBadges(currentProfile: AgentCore): string[] {
    const tags = (currentProfile as any)?.tags
    if (Array.isArray(tags)) return tags.filter((x) => typeof x === 'string') as string[]
    const legacy = (currentProfile as any)?.badges
    if (Array.isArray(legacy)) return legacy.filter((x) => typeof x === 'string') as string[]
    return []
  }

  function card(entry: AgentDirectoryEntry): AgentCard.Card {
    const displayName = entry.user?.display_name ?? entry.title

    return {
      id: entry.id,
      to: `/${agentConfig.collectionName}/${entry.id}`,

      avatarUrl: entry.user?.avatar ?? '',

      displayName,
      tagline: entry.tagline,
      badges: resolveBadges(entry),

      bioShort: entry.bio_short,

      // IMPORTANT: only render contactEmail on authorized UI surfaces.
      contactEmail: entry.contact_email.trim(),
      contactPhone: entry.contact_phone.trim(),
      websiteUrl: entry.website_url,
    }
  }

  function searchText(entry: AgentDirectoryEntry): string {
    const displayName = entry.user?.display_name ?? entry.title
    return `${displayName} ${entry.tagline} ${entry.id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
