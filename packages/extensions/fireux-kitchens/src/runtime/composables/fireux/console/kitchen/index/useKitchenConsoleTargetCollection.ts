// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: consume the authenticated bounded target projection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: defer duplicate keyed requests while one projection is in flight.
import { useAsyncData } from '#imports'
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
  useFirestoreCollectionState,
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
  response: KitchenConsoleTargetsResponse
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
  const state = useAsyncData<KitchenConsoleTargetState | null>(
    () => `kitchen-console-targets-${appId}-${uid.value || 'signed-out'}`,
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (!user || user.uid !== requestUid) {
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
      immediate: false,
      dedupe: 'defer',
    }
  )
  watch(
    () => ({
      enabled: enabled.value,
      hasAuthState: hasAuthState.value,
      uid: uid.value,
    }),
    ({ enabled: canLoad, hasAuthState: authReady, uid: requestUid }) => {
      if (!canLoad || !authReady || !requestUid) return
      void state.execute()
    },
    { immediate: true }
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
      const kitchen = surface({ kitchen: target, console: { mode: 'live' } })
      return kitchen ? [kitchen] : []
    })
  )
  const count = computed(() => kitchens.value.length)
  const apps = computed(() => response.value?.appItems ?? [])
  const active = computed(() => enabled.value && Boolean(uid.value))
  const pending = computed(
    () =>
      enabled.value &&
      (!hasAuthState.value ||
        (active.value &&
          (state.status.value === 'idle' ||
            state.pending.value ||
            (!state.error.value && response.value === null))))
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
    apps,
    count,
    pending,
    error,
    outcome,
    refresh: async () => {
      await state.refresh()
    },
  }
}
