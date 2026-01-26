import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

type UserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type AgentDirectoryEntry = AgentCore & { user?: User | UserSummary }

export namespace AgentCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    displayName: string
    tagline: string

    // Status/label chips
    badges: string[]

    // Short bio shown in lists
    bioShort: string

    // IMPORTANT: only render contactEmail on authorized UI surfaces.
    contactEmail: string
    contactPhone: string
    websiteUrl: string
  }
}

export function useAgentInterface(
  profile?: ProfileRefs<AgentCore> | null,
  userRef?: Ref<User | null | undefined>
) {
  function map(p: AgentCore, u?: UserLike | null): AgentCard.Card {
    const id = safeString(p.id).trim()
    const title = safeString(p.title)
    const subtitle = safeString(p.subtitle)
    const tagline = safeString(p.tagline)

    return {
      id,
      to: id ? `/${agentConfig.collectionName}/${id}` : '',

      avatarUrl: safeString(u?.avatar),

      // Canonical: agent pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),

      // Prefer tagline; fall back to title/subtitle so pills stay useful.
      tagline: tagline || title || subtitle,
      badges: safeStringArray(p.tags),

      bioShort: safeString(p.bio_short),

      contactEmail: safeString(p.contact_email).trim(),
      contactPhone: safeString(p.contact_phone).trim(),
      websiteUrl: safeString(p.website_url),
    }
  }

  function card(
    target?: AgentCore | null | undefined,
    userOverride?: UserLike | null
  ): AgentCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  function cardFromEntry(entry?: AgentDirectoryEntry | null): AgentCard.Card | null {
    if (!entry) return null
    const mapped = map(entry, entry.user ?? null)
    return mapped.id ? mapped : null
  }

  function searchText(
    target?: AgentCore | null | undefined,
    userOverride?: UserLike | null
  ): string {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return ''
    const u = userOverride ?? userRef?.value ?? null
    const displayName = safeString(u?.display_name)
    const title = safeString(p.title)
    const tagline = safeString(p.tagline)
    const id = safeString(p.id)
    return `${displayName} ${title} ${tagline} ${id}`.trim().toLowerCase()
  }

  function searchTextFromEntry(entry?: AgentDirectoryEntry | null): string {
    if (!entry) return ''
    const displayName = safeString(entry.user?.display_name)
    const title = safeString(entry.title)
    const tagline = safeString(entry.tagline)
    const id = safeString(entry.id)
    return `${displayName} ${title} ${tagline} ${id}`.trim().toLowerCase()
  }

  return { card, searchText, cardFromEntry, searchTextFromEntry }
}
