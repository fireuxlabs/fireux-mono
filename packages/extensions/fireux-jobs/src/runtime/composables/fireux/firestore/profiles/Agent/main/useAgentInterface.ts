// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentInterface.ts

import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { agentConfig, type AgentCore } from '../../../../../../models/profiles/Agent/Agent.model'

export namespace AgentCard {
  export type Card = {
    id: string
    to: string
    avatar: string
    title: string
    subtitle: string
    badges: string[]
    line1: string
    line2: string
    line3: string
  }
}

export function useAgentInterface(profile: ProfileRefs<AgentCore>, user: Ref<User | null | undefined>) {
  const resolveProfile = (target?: AgentCore): AgentCore => {
    const current = target ?? profile.coreProfile.value
    if (!current) {
      throw new Error('[useAgentInterface] Agent profile is required')
    }
    return current
  }

  const resolveUser = (): User => {
    const current = user.value
    if (!current) {
      throw new Error('[useAgentInterface] User is required')
    }
    return current
  }

  const card = (target?: AgentCore): AgentCard.Card => {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser()

    return {
      id: currentProfile.id,
      to: `/${agentConfig.collectionName}/${currentProfile.id}`,
      avatar: currentUser.avatar,
      title: currentProfile.title,
      subtitle: currentProfile.tagline,
      badges: [],
      line1: currentProfile.bio_short,
      line2: currentProfile.contact_email,
      line3: currentProfile.website_url,
    }
  }

  return { card }
}
