import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { Agent } from '../../../../../utils/profiles/Agent/agent'
import { computed } from 'vue'

/**
 * useAgentComputed
 * - Small, model-backed derived helpers for Agent profiles
 * - Keeps business status and authority out of the identity capability seam
 * - Safe to spread into useAgent() return
 */
export function useAgentComputed(
  refs: ProfileRefs<Agent>,
  pending?: unknown
) {
  void pending

  const agentProfile = computed(() => refs.profile.value ?? null)
  const hasAgentProfile = computed(() => Boolean(agentProfile.value?.id))
  const displayName = computed(() =>
    String(
      agentProfile.value?.title ||
        agentProfile.value?.subtitle ||
        agentProfile.value?.id ||
        ''
    ).trim()
  )
  const hasDisplayName = computed(() => Boolean(displayName.value))
  const displayImageUrl = computed(() =>
    String(agentProfile.value?.agent_image || '').trim()
  )
  const hasBio = computed(() =>
    Boolean(
      String(
        agentProfile.value?.summary ||
          agentProfile.value?.agent_bio ||
          ''
      ).trim()
    )
  )

  return {
    agentProfile,
    hasAgentProfile,
    hasDisplayName,
    displayName,
    displayImageUrl,
    hasBio,
  }
}
