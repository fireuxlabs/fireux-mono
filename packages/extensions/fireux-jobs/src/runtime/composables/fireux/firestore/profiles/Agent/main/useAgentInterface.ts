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
  const resolveProfile = (target?: AgentCore) => target || profile.coreProfile.value || undefined
  const resolveUser = (target?: (AgentCore & { user?: User | null }) | AgentCore) =>
    (target as any)?.user || user.value || undefined

  const card = (target?: AgentCore): AgentCard.Card => {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser(target)

    const id = String(currentProfile?.id || currentUser?.id || '').trim()
    const to = id ? `/${agentConfig.collectionName}/${id}` : ''

    const avatar = String(currentUser?.avatar || '').trim()
    const title = String(currentUser?.display_name || currentUser?.email || 'Agent').trim() || 'Agent'

    const tagline = String((currentProfile as any)?.tagline || (currentProfile as any)?.subtitle || '').trim()
    const subtitle = tagline

    const rawBadges = Array.isArray((currentProfile as any)?.badges)
      ? ((currentProfile as any).badges as unknown[])
      : []
    const badges = rawBadges.map((b) => String(b).trim()).filter(Boolean)

    const line1 = ''
    const line2 = ''
    const line3 = ''

    return {
      id,
      to,
      avatar,
      title,
      subtitle,
      badges,
      line1,
      line2,
      line3,
    }
  }

  return { card }
}
