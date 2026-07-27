// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: consume the authenticated bounded target projection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: defer duplicate keyed requests while one projection is in flight.
import { useAsyncData } from '#imports'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import type { KitchenConsoleTargetsResponse } from '../../../../../models/kitchen/kitchen-index.model'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'

type KitchenConsoleTargetState = {
  requestUid: string
  response: KitchenConsoleTargetsResponse
}

export type UseKitchenConsoleTargetCollectionResult = {
  kitchens: ComputedRef<KitchenSurface[]>
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
  const state = useAsyncData<KitchenConsoleTargetState | null>(
    () => `kitchen-console-targets-${appId}-${uid.value || 'signed-out'}`,
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (
        !enabled.value ||
        !import.meta.client ||
        !hasAuthState.value ||
        !user ||
        user.uid !== requestUid
      ) {
        return null
      }

      const token = await user.getIdToken()
      if (
        !enabled.value ||
        !hasAuthState.value ||
        currentUser.value?.uid !== requestUid
      ) {
        return null
      }
      const response = await $fetch<KitchenConsoleTargetsResponse>(
        '/api/console/kitchen/targets',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return { requestUid, response }
    },
    {
      server: false,
      lazy: true,
      dedupe: 'defer',
      watch: [enabled, hasAuthState, uid],
    }
  )
  const response = computed<KitchenConsoleTargetsResponse | null>(() => {
    if (!enabled.value) return null

    const value = state.data.value
    if (
      !value ||
      value.requestUid !== uid.value ||
      value.response.appId !== appId
    ) {
      return null
    }
    return value.response
  })
  const kitchens = computed<KitchenSurface[]>(() =>
    (response.value?.items ?? []).flatMap((target) => {
      const kitchen = surface({ kitchen: target, routeScope: 'live' })
      return kitchen ? [kitchen] : []
    })
  )
  const count = computed(() => kitchens.value.length)
  const active = computed(() => enabled.value && Boolean(uid.value))
  const pending = computed(
    () =>
      enabled.value &&
      (!hasAuthState.value || (active.value && state.pending.value))
  )
  const error = computed<unknown | undefined>(() =>
    active.value ? (state.error.value ?? undefined) : undefined
  )
  const { outcome } = useFirestoreCollectionState({
    active,
    count,
    error,
    pending,
  })

  return {
    kitchens,
    count,
    pending,
    error,
    outcome,
    refresh: async () => {
      await state.refresh()
    },
  }
}
