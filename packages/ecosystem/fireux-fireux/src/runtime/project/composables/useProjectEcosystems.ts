import { useAsyncData } from 'nuxt/app'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'

/** Authorized Project relationship with live owning-system dependencies. */
export function useProjectEcosystems(
  id: MaybeRefOrGetter<string | null | undefined>
) {
  const { currentUser } = useAuth()
  const projectId = computed(() => String(toValue(id) || '').trim())
  const active = computed(() =>
    Boolean(
      projectId.value && currentUser.value && !currentUser.value.isAnonymous
    )
  )
  const key = computed(
    () =>
      `project-ecosystems:${currentUser.value?.uid || ''}:${projectId.value}`
  )
  const source = useAsyncData(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const requestKey = key.value
      const requestId = projectId.value
      const user = currentUser.value
      if (!active.value || !user) return null
      const token = await user.getIdToken()
      const result = await fetchRead<{
        project_id: string
        ecosystems: Ecosystem[]
      }>(
        `/api/internal/control/projects/${encodeURIComponent(requestId)}/ecosystems`,
        { headers: { authorization: `Bearer ${token}` } }
      )
      if (
        result.project_id !== requestId ||
        result.ecosystems.some(
          (ecosystem) => ecosystem.project_id !== requestId
        )
      )
        throw new Error(
          'Project Ecosystem response did not match the requested Project.'
        )
      return { ...result, requestKey }
    },
    { server: false }
  )
  const current = computed(() => source.data.value?.requestKey === key.value)
  const ecosystems = computed(() =>
    active.value &&
    current.value &&
    !source.error.value &&
    !source.pending.value
      ? source.data.value?.ecosystems || []
      : []
  )
  const count = computed(() => ecosystems.value.length)
  const outcome = computed(() => {
    if (!active.value) return 'idle'
    if (!current.value && !source.error.value) return 'pending'
    return resolveReadOutcome({
      enabled: active.value,
      pending: source.pending.value,
      failed: Boolean(source.error.value),
      present: count.value > 0,
    })
  })
  return {
    projectId,
    ecosystems,
    count,
    pending: source.pending,
    error: source.error,
    outcome,
  }
}
