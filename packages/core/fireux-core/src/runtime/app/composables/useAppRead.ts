import { useAsyncData, type AsyncData } from 'nuxt/app'
import { computed, unref, type MaybeRef } from 'vue'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { resolveReadOutcome } from '../../utils/read-outcome'
import type { App } from '../models/model'

type AppSnapshot = {
  appId: string
  initialized: boolean
  app: App | null
}

/** Current App metadata and initialization state share the safe status projection. */
export function useAppRead(id: MaybeRef<string | null | undefined>) {
  const { uid, isAuthenticated, hasAuthState } = useAuth()
  const targetId = computed(() =>
    hasAuthState.value && isAuthenticated.value && uid.value
      ? String(unref(id) || '').trim()
      : ''
  )
  const key = computed(() =>
    JSON.stringify(['app-read', targetId.value, uid.value])
  )
  const source = useAsyncData(
    key,
    async (_app, { signal }) => {
      if (!targetId.value) return null
      const expected = targetId.value,
        requestKey = key.value
      const snapshot = await $fetch<AppSnapshot>('/api/app/status', {
        signal,
        cache: 'no-store',
      })
      if (snapshot.appId !== expected)
        throw new Error('App snapshot belongs to another App.')
      return { ...snapshot, key: requestKey }
    },
    { server: false }
  )
  const current = computed(() =>
    targetId.value &&
    !source.pending.value &&
    !source.error.value &&
    source.data.value?.key === key.value
      ? source.data.value
      : undefined
  )
  const app = computed(() => current.value?.app)
  const exists = computed(() => current.value?.initialized)
  const pending = computed(
    () =>
      Boolean(targetId.value) &&
      (source.pending.value ||
        Boolean(source.data.value && source.data.value.key !== key.value))
  )
  const error = computed(() =>
    targetId.value ? source.error.value : undefined
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: Boolean(targetId.value),
      pending: pending.value,
      failed: Boolean(error.value),
      present: Boolean(app.value),
    })
  )
  return {
    app,
    exists,
    pending,
    error,
    outcome,
    refresh: source.refresh as AsyncData<unknown, unknown>['refresh'],
  }
}
