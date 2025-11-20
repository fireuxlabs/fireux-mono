import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  agentConfig,
  type AgentProfile,
  type AgentCard,
} from '../../../../../models/profiles/Agent.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${agentConfig.collectionName}/${id}` : null

/**
 * Minimal agent interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile.subtitle.
 */
export function useAgentInterface(
  profile: ProfileRefs<AgentProfile>,
  user: Ref<User | null>
) {
  // Guardrail: keep the pill minimal—canonical user name/avatar + profile subtitle only.
  const pill = computed<AgentCard.Pill | null>(() => {
    const u = user.value
    if (!u) return null

    return {
      avatar: u.avatar ?? '',
      title: u.display_name ?? '',
      subtitle: profile.coreProfile.value?.subtitle ?? '',
      badges: [],
      to: routeFor(u.id),
    }
  })

  return { pill }
}

export const resolveAgentPill = (
  profile?: AgentProfile | null
): AgentCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle: profile?.subtitle ?? '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveAgentPillKey = (pill: AgentCard.Pill) =>
  pill.to ?? pill.title ?? 'agent'
