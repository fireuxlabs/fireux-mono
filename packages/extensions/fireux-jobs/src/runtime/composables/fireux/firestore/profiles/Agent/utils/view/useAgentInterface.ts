import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model'

export namespace AgentCard {
  export type Card = {
    id: string
    to: string

    avatarUrl: string

    displayName: string
    tagline: string
    badges: string[]

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
  function map(p: AgentCore, u?: User | null): AgentCard.Card {
    return {
      id: p.id,
      to: `/${agentConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      displayName: u?.display_name ?? p.title,
      tagline: p.tagline,
      badges: p.tags,

      bioShort: p.bio_short,

      contactEmail: p.contact_email,
      contactPhone: p.contact_phone,
      websiteUrl: p.website_url,
    }
  }

  function card(target?: AgentCore | null | undefined): AgentCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    return map(p, userRef?.value ?? null)
  }

  function searchText(target?: AgentCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null
    const name = u?.display_name ?? p.title
    return `${name} ${p.tagline} ${p.id}`.toLowerCase()
  }

  return { card, searchText }
}
