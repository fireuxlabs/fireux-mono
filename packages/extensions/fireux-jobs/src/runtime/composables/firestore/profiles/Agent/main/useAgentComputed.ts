import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { AgentProfile } from '../../../../../models/profiles/Agent.model.ts'

/**
 * useAgentComputed
 * - Stubbed computed helpers for Agent profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useAgent() return
 */
export function useAgentComputed(
  refs: ProfileRefs<AgentProfile>,
  pending?: Ref<boolean>
) {
  const coreProfile = refs.coreProfile
  const appProfile = refs.appProfile

  const activeProfile = computed<AgentProfile | null>(() => {
    const core = coreProfile.value ?? null
    const scoped = appProfile.value ?? null

    if (!core && !scoped) return null
    return {
      ...(core ?? {}),
      ...(scoped ?? {}),
    } as AgentProfile
  })

  const isPending = computed(() => Boolean(pending?.value))
  const hasCoreProfile = computed(() => Boolean(coreProfile.value))
  const hasAppProfile = computed(() => Boolean(appProfile.value))

  return {
    activeProfile,
    isPending,
    hasCoreProfile,
    hasAppProfile,
  }
}
