// Concurrent edit — 2026-07-20 16:35 CEST — Repo Efficiency Pass 1 of 6: load canonical Apps through the authenticated dev API and identity-gate cached data.
// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish portable collection control declarations.

import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import type { App } from '../../app/models/app.model.ts'
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

export type DevAppCollectionOutcome = 'pending' | 'error' | 'ready' | 'empty'

type DevAppCollectionControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseDevAppCollectionReturn = DevAppCollectionControls & {
  apps: ComputedRef<App[]>
  count: ComputedRef<number>
  outcome: ComputedRef<DevAppCollectionOutcome>
  truncated: ComputedRef<boolean>
}

export function useDevAppCollection(): UseDevAppCollectionReturn {
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
    return items
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
