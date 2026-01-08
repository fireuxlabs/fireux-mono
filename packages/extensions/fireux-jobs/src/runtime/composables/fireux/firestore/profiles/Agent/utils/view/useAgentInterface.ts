// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts

import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model.ts'

export namespace AgentCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    displayName: string
    tagline: string
    badges: string[]
    bioShort: string
    contactEmail: string
    websiteUrl: string
  }
}

type MaybeEnrichedAgent = AgentCore & { user?: Partial<Pick<User, 'avatar'>> | null }

export function useAgentInterface(
  profile: ProfileRefs<AgentCore>,
  user?: Ref<User | null | undefined>
) {
  function resolveProfile(target?: AgentCore | null | undefined): AgentCore | null {
    return target ?? profile.coreProfile.value ?? null
  }

  function resolveAvatar(target?: AgentCore | null | undefined): string {
    const enriched = target as MaybeEnrichedAgent | null | undefined
    const enrichedAvatar = enriched?.user?.avatar
    if (typeof enrichedAvatar === 'string' && enrichedAvatar) return enrichedAvatar

    const fallbackAvatar = user?.value?.avatar
    return typeof fallbackAvatar === 'string' ? fallbackAvatar : ''
  }

  function resolveContactEmail(target?: AgentCore | null | undefined): string {
    const currentProfile = resolveProfile(target)
    if (!currentProfile) return ''
    if (currentProfile.contact_email_from_profile) {
      return user?.value?.email?.trim() || ''
    }
    return currentProfile.contact_email?.trim() || ''
  }

  function card(target: AgentCore): AgentCard.Card
  function card(target?: AgentCore | null | undefined): AgentCard.Card | null
  function card(target?: AgentCore | null | undefined): AgentCard.Card | null {
    const currentProfile = resolveProfile(target)
    if (!currentProfile) return null

    return {
      id: currentProfile.id,
      to: `/${agentConfig.collectionName}/${currentProfile.id}`,
      avatarUrl: resolveAvatar(target),
      displayName: currentProfile.title,
      tagline: currentProfile.tagline,
      badges: currentProfile.badges,
      bioShort: currentProfile.bio_short,
      contactEmail: resolveContactEmail(currentProfile),
      websiteUrl: currentProfile.website_url,
    }
  }

  return { card }
}
