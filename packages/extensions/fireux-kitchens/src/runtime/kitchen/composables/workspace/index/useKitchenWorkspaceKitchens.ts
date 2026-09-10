import {
  collection,
  documentId,
  query,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../../../models/kitchen.model.ts'
import type { KitchenSurface } from '../../../models/kitchen-interface.model'
import { useKitchenInterface } from '../../useKitchenInterface'

export type UseKitchenWorkspaceKitchensResult = {
  kitchens: ComputedRef<KitchenSurface[]>
  primaryKitchenId: ComputedRef<string>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<WorkspaceTargetOutcome>
}

/** Live, membership-bounded Kitchen targets and their Place presentation. */
export function useKitchenWorkspaceKitchens(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenWorkspaceKitchensResult {
  const app = useAppSession()
  const resolveDb = useFirestoreResolver()
  const { firestoreQuery } = useFirestoreRead()
  const { surface } = useKitchenInterface()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const kitchenIds = computed(() =>
    enabled.value
      ? (app.appUser.value?.kitchens ?? [])
          .map((id) => String(id || '').trim())
          .filter(Boolean)
      : []
  )
  const kitchenQuery = computed<Query<Kitchen> | null>(() =>
    kitchenIds.value.length
      ? (query(
          collection(resolveDb(), 'kitchens'),
          where(documentId(), 'in', kitchenIds.value)
        ) as Query<Kitchen>)
      : null
  )
  const kitchenSource = firestoreQuery<Kitchen>(
    kitchenQuery,
    'workspace-kitchens',
    'kitchens'
  )
  const placeIds = computed(() =>
    (kitchenSource.value ?? [])
      .map((kitchen) => String(kitchen.id || '').trim())
      .filter(Boolean)
  )
  const placeQuery = computed<Query<Place> | null>(() =>
    placeIds.value.length
      ? (query(
          collection(resolveDb(), 'places'),
          where(documentId(), 'in', placeIds.value)
        ) as Query<Place>)
      : null
  )
  const placeSource = firestoreQuery<Place>(
    placeQuery,
    'workspace-kitchen-places',
    'places'
  )
  const places = computed(
    () => new Map((placeSource.value ?? []).map((place) => [place.id, place]))
  )
  const kitchens = computed<KitchenSurface[]>(() =>
    (kitchenSource.value ?? []).flatMap((kitchen) => {
      const placeId = String(kitchen.id || '').trim()
      const value = surface({
        kitchen: { ...kitchen, can_write: true },
        place: places.value.get(placeId) ?? null,
        routeScope: 'live',
      })
      return value ? [value] : []
    })
  )
  const pending = computed(
    () =>
      app.pending.value ||
      kitchenSource.outcome.value === 'pending' ||
      (placeIds.value.length > 0 && placeSource.outcome.value === 'pending')
  )
  const error = computed(
    () =>
      app.error.value ?? kitchenSource.error.value ?? placeSource.error.value
  )

  return {
    kitchens,
    primaryKitchenId: computed(() => app.appUser.value?.primary_kitchen ?? ''),
    count: computed(() => kitchens.value.length),
    pending,
    error,
    outcome: computed(() => {
      if (!enabled.value) return 'idle'
      if (pending.value) return 'pending'
      if (error.value) return 'error'
      return kitchens.value.length ? 'ready' : kitchenIds.value.length ? 'missing' : 'empty'
    }),
  }
}
