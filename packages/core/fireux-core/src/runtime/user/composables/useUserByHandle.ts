import { useAsyncData } from 'nuxt/app'
import { computed, unref, type Ref } from 'vue'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { normalizeUserHandle } from '../utils/user-handle'
import type { UserIdentitySummary } from '../models/user-directory.model'
import { resolveReadOutcome } from '../../utils/read-outcome'

/** Canonical lookup for App membership administration, independent of directory eligibility. */
export function useUserByHandle(
  handle: string | null | undefined | Ref<string | null | undefined>
) {
  const { currentUser } = useAuth()
  const { appId } = useFireUXConfig()
  const normalized = computed(() =>
    normalizeUserHandle(
      String(unref(handle) || '')
        .trim()
        .replace(/^@/, '')
    )
  )
  const key = computed(() =>
    JSON.stringify([
      'member-identity',
      appId,
      currentUser.value?.uid,
      normalized.value,
    ])
  )
  const state = useAsyncData(
    key,
    async (_app, { signal }) => {
      const requestKey = key.value,
        actor = currentUser.value,
        requested = normalized.value
      if (!actor || !requested) return { key: requestKey, user: null }
      const token = await actor.getIdToken()
      if (actor.uid !== currentUser.value?.uid)
        throw new Error('The account changed.')
      const user = await $fetch<UserIdentitySummary | null>(
        '/api/internal/app/membership/identity',
        {
          signal,
          query: { handle: requested },
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return { key: requestKey, user }
    },
    { server: false }
  )
  const user = computed(() =>
    state.data.value?.key === key.value &&
    !state.pending.value &&
    !state.error.value
      ? state.data.value.user
      : null
  )
  const pending = computed(
    () =>
      state.pending.value ||
      Boolean(state.data.value && state.data.value.key !== key.value)
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: Boolean(normalized.value && currentUser.value),
      pending: pending.value,
      failed: Boolean(state.error.value),
      present: Boolean(user.value),
    })
  )
  return {
    user,
    uid: computed(() => user.value?.id || null),
    handle: normalized,
    pending,
    resolving: pending,
    error: state.error,
    outcome,
    empty: computed(() => outcome.value === 'empty'),
  }
}
