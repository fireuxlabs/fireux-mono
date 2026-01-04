// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts

import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model.ts'
import type { AgentCard } from '../../../../../../../types/profiles/AgentCard.ts'

export function useAgentInterface(profile: ProfileRefs<AgentCore>, user: Ref<User | null | undefined>) {
  function resolveProfile(target?: AgentCore | null | undefined): AgentCore | null {
    return target ?? profile.coreProfile.value ?? null
  }

  function resolveUser(): User | null {
    return user.value ?? null
  }

  function card(target: AgentCore): AgentCard.Card
  function card(target?: AgentCore | null | undefined): AgentCard.Card | null
  function card(target?: AgentCore | null | undefined): AgentCard.Card | null {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser()
    if (!currentProfile || !currentUser) return null

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
