// Concurrent edit — 2026-07-20 16:35 CEST — Repo Efficiency Pass 1 of 6: load canonical Apps through the authenticated dev API and identity-gate cached data.

import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type { App } from '../../models/core/app.model'
import { useAuth } from '../fireux/firebase/useAuth'

type DevAppCollectionResponse = {
  ok: boolean
  items: App[]
  count: number
  truncated: boolean
}

type DevAppCollectionState = DevAppCollectionResponse & {
  requestUid: string
}

export function useDevAppCollection() {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const { data, pending, error, refresh } = useAsyncData(
    'dev-app-collection',
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (
        !import.meta.client ||
        !hasAuthState.value ||
        !user ||
        user.uid !== requestUid
      ) {
        return {
          ok: false,
          items: [],
          count: 0,
          truncated: false,
          requestUid: '',
        } satisfies DevAppCollectionState
      }

      const token = await user.getIdToken()
      const response = await $fetch<DevAppCollectionResponse>('/api/dev/apps', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return { ...response, requestUid } satisfies DevAppCollectionState
    },
    {
      server: false,
      lazy: true,
      watch: [hasAuthState, uid],
    }
  )

  const apps = computed(() => {
    const items = data.value?.requestUid === uid.value ? data.value.items : []
    return items.filter(
      (app) => String(app.status ?? '').trim() !== 'retired'
    )
  })
  const truncated = computed(
    () => data.value?.requestUid === uid.value && data.value.truncated === true
  )
  const count = computed(() => apps.value.length)
  const outcome = computed(() => {
    if (pending.value || !hasAuthState.value) return 'pending' as const
    if (error.value) return 'error' as const
    return count.value ? ('ready' as const) : ('empty' as const)
  })

  return { apps, count, pending, error, outcome, truncated, refresh }
}
