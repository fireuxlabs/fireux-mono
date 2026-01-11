// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts

import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model.ts'

export namespace AgentCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    displayName: string
    tagline: string
    badges: string[]

    bioShort: string

    // IMPORTANT: only render contactEmail on authorized UI surfaces.
    contactEmail: string
    websiteUrl: string
  }
}

export function useAgentInterface(
  profile: ProfileRefs<AgentCore>,
  userRef?: Ref<User | null | undefined>
) {
  function resolveBadges(currentProfile: AgentCore): string[] {
    const tags = (currentProfile as any)?.tags
    if (Array.isArray(tags)) return tags.filter((x) => typeof x === 'string') as string[]
    const legacy = (currentProfile as any)?.badges
    if (Array.isArray(legacy)) return legacy.filter((x) => typeof x === 'string') as string[]
    return []
  }

  function map(currentProfile: AgentCore, user?: User | null): AgentCard.Card {
    const displayName = user?.display_name ?? currentProfile.title

    return {
      id: currentProfile.id,
      to: `/${agentConfig.collectionName}/${currentProfile.id}`,

      avatarUrl: user?.avatar ?? '',

      displayName,
      tagline: currentProfile.tagline,

      badges: resolveBadges(currentProfile),

      bioShort: currentProfile.bio_short,

      // Keep strictly profile-owned here. Authorized surfaces can decide to override later.
      contactEmail: currentProfile.contact_email.trim(),
      websiteUrl: currentProfile.website_url,
    }
  }

  function card(target?: AgentCore | null | undefined): AgentCard.Card | null {
    const currentProfile = target ?? profile.coreProfile.value ?? null
    const user = userRef?.value ?? null

    return currentProfile ? map(currentProfile, user) : null
  }

  function searchText(target?: AgentCore | null | undefined): string {
    const currentProfile = target ?? profile.coreProfile.value ?? null
    const user = userRef?.value ?? null
    if (!currentProfile) return ''

    const displayName = user?.display_name ?? currentProfile.title ?? ''

    return `${displayName} ${currentProfile.tagline ?? ''} ${currentProfile.id ?? ''}`
      .trim()
      .toLowerCase()
  }

  return { card, searchText }
}
