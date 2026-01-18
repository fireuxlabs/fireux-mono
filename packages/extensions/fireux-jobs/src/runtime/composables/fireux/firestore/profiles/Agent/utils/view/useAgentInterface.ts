import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

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
  profile: ProfileRefs<AgentCore>,
  userRef?: Ref<User | null | undefined>
) {
  function map(p: AgentCore, u?: UserLike | null): AgentCard.Card {
    const title = p.title
    const subtitle = p.subtitle
    const tagline = p.tagline
    const tags = p.tags

    return {
      id: p.id,
      to: `/${agentConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      // Canonical: agent pills are user-hydrated; no profile-title fallback for display name.
      displayName: u?.display_name ?? '',

      // Prefer tagline; fall back to title/subtitle so pills stay useful.
      tagline: tagline || title || subtitle,
      badges: tags,

      bioShort: p.bio_short,

      contactEmail: p.contact_email.trim(),
      contactPhone: p.contact_phone.trim(),
      websiteUrl: p.website_url,
    }
  }

  function card(
    target?: AgentCore | null | undefined,
    userOverride?: UserLike | null
  ): AgentCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    return map(p, u)
  }

  function searchText(target?: AgentCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null
    const displayName = u?.display_name ?? ''
    return `${displayName} ${p.title} ${p.tagline} ${p.id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
