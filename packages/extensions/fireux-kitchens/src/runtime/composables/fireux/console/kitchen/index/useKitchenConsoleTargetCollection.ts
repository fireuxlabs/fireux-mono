// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: consume the authenticated bounded target projection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: defer duplicate keyed requests while one projection is in flight.
import { useState } from '#imports'
import {
  computed,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import type {
  KitchenConsoleAppTargetItem,
  KitchenConsoleTargetsResponse,
} from '../../../../../models/kitchen/kitchen-index.model'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'

type KitchenConsoleTargetState = {
  requestUid: string
  outcome: FirestoreCollectionOutcome
  response: KitchenConsoleTargetsResponse | null
  error: string | null
}

export type UseKitchenConsoleTargetCollectionResult = {
  kitchens: ComputedRef<KitchenSurface[]>
  apps: ComputedRef<KitchenConsoleAppTargetItem[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<FirestoreCollectionOutcome>
  refresh: () => Promise<void>
}

export function useKitchenConsoleTargetCollection(
  options: {
    enabled?: MaybeRefOrGetter<boolean>
  } = {}
): UseKitchenConsoleTargetCollectionResult {
  const { appId } = useFireUXConfig()
  const { currentUser, hasAuthState } = useAuth()
  const { surface } = useKitchenInterface()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const state = useState<KitchenConsoleTargetState>(
    `kitchen-console-targets-${appId}`,
    () => ({
      requestUid: '',
      outcome: 'idle',
      response: null,
      error: null,
    })
  )
  const load = async (requestUid: string, force = false) => {
    const user = currentUser.value
    if (
      !import.meta.client ||
      !enabled.value ||
      !hasAuthState.value ||
      !requestUid ||
      user?.uid !== requestUid
    ) {
      return
    }
    if (
      !force &&
      state.value.requestUid === requestUid &&
      state.value.outcome !== 'idle' &&
      state.value.outcome !== 'error'
    ) {
      return
    }

    state.value = {
      requestUid,
      outcome: 'pending',
      response: null,
      error: null,
    }
    try {
      const token = await user.getIdToken()
      const response = await $fetch<KitchenConsoleTargetsResponse>(
        '/api/console/kitchen/targets',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (currentUser.value?.uid !== requestUid || response.appId !== appId) {
        return
      }
      state.value = {
        requestUid,
        outcome: response.items.length > 0 ? 'ready' : 'empty',
        response,
        error: null,
      }
    } catch (error) {
      if (currentUser.value?.uid !== requestUid) return
      state.value = {
        requestUid,
        outcome: 'error',
        response: null,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
  watch(
    () => ({
      enabled: enabled.value,
      hasAuthState: hasAuthState.value,
      uid: uid.value,
    }),
    ({ enabled: canLoad, hasAuthState: authReady, uid: requestUid }: {
      enabled: boolean
      hasAuthState: boolean
      uid: string
    }) => {
      if (!authReady) return
      if (!requestUid) {
        state.value = {
          requestUid: '',
          outcome: 'idle',
          response: null,
          error: null,
        }
        return
      }
      if (!canLoad) return
      void load(requestUid)
    },
    { immediate: true }
  )
  const response = computed<KitchenConsoleTargetsResponse | null>(() => {
    if (!enabled.value) return null

    const value = state.value
    if (
      value.requestUid !== uid.value ||
      value.response?.appId !== appId
    ) {
      return null
    }
    return value.response
  })
  const kitchens = computed<KitchenSurface[]>(() =>
    (response.value?.items ?? []).flatMap((target) => {
      const kitchen = surface({ kitchen: target, console: { mode: 'live' } })
      return kitchen ? [kitchen] : []
    })
  )
  const count = computed(() => kitchens.value.length)
  const apps = computed(() => response.value?.appItems ?? [])
  const active = computed(() => enabled.value && Boolean(uid.value))
  const outcome = computed<FirestoreCollectionOutcome>(() => {
    if (!enabled.value || (hasAuthState.value && !uid.value)) return 'idle'
    if (!hasAuthState.value || state.value.requestUid !== uid.value) {
      return 'pending'
    }
    return state.value.outcome
  })
  const pending = computed(() => outcome.value === 'pending')
  const error = computed<unknown | undefined>(() =>
    active.value && state.value.requestUid === uid.value
      ? (state.value.error ?? undefined)
      : undefined
  )

  return {
    kitchens,
    apps,
    count,
    pending,
    error,
    outcome,
    refresh: async () => {
      await load(uid.value, true)
    },
  }
}
