import { useAsyncData } from 'nuxt/app'
import { computed, type Ref } from 'vue'
import type { UserIdentitySummary } from '../models/user-directory.model'
import { resolveReadOutcome } from '../../utils/read-outcome'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'

/** Hydrate display identities through the existing public summary projection. */
export function useUserHydration(ids: Ref<(string | null | undefined)[]>) {
  const databaseId = readRuntimeIdentityFirestoreDatabaseId()
  const requested = computed(() =>
    [
      ...new Set(
        ids.value.map((id) => String(id || '').trim()).filter(Boolean)
      ),
    ].sort()
  )
  const key = computed(() =>
    JSON.stringify(['user-identities', databaseId, requested.value])
  )
  const state = useAsyncData(key, async (_app, { signal }) => {
    const requestKey = key.value
    const wanted = [...requested.value]
    const items: UserIdentitySummary[] = []
    const fetchRead = $fetch.create({ signal, cache: 'no-store' })
    for (let offset = 0; offset < wanted.length; offset += 100) {
      items.push(
        ...(await fetchRead<UserIdentitySummary[]>('/api/user-identities', {
          query: { ids: wanted.slice(offset, offset + 100) },
        }))
      )
    }
    return { key: requestKey, items }
  })
  const users = computed(() =>
    state.data.value?.key === key.value && !state.error.value
      ? state.data.value.items
      : []
  )
  const pending = computed(
    () =>
      state.pending.value ||
      Boolean(state.data.value && state.data.value.key !== key.value)
  )
  const usersById = computed(
    () => new Map(users.value.map((user) => [user.id, user]))
  )
  return {
    users,
    usersById,
    userById: (id: string | null | undefined) =>
      id ? usersById.value.get(id) : undefined,
    pending,
    error: state.error,
    outcome: computed(() =>
      resolveReadOutcome({
        enabled: requested.value.length > 0,
        pending: pending.value,
        failed: Boolean(state.error.value),
        present: users.value.length > 0,
      })
    ),
  }
}
