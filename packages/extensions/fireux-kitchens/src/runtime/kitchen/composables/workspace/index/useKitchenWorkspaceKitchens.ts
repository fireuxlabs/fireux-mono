import {
  collection,
  documentId,
  query,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../../../models/kitchen.model.ts'
import type { KitchenSurface } from '../../../models/kitchen-interface.model'
import { useKitchenInterface } from '../../useKitchenInterface'

export type UseKitchenWorkspaceKitchensResult = {
  kitchens: ComputedRef<KitchenSurface[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<WorkspaceTargetOutcome>
}

/** Live, membership-bounded Kitchen targets and their Place presentation. */
export function useKitchenWorkspaceKitchens(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenWorkspaceKitchensResult {
  const access = useKitchenAccess()
  const resolveDb = useFirestoreResolver()
  const { firestoreQuery } = useFirestoreRead()
  const { surface } = useKitchenInterface()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const kitchenIds = computed(() =>
    enabled.value
      ? access.ids.value.map((id) => String(id || '').trim()).filter(Boolean)
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
      .filter((kitchen) => kitchenIds.value.includes(kitchen.id || ''))
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
    (pending.value || error.value ? [] : (kitchenSource.value ?? [])).flatMap(
      (kitchen) => {
        if (!kitchenIds.value.includes(kitchen.id || '')) return []
        const placeId = String(kitchen.id || '').trim()
        const value = surface({
          kitchen: { ...kitchen, can_write: true },
          place: places.value.get(placeId) ?? null,
          routeScope: 'live',
        })
        return value ? [value] : []
      }
    )
  )
  const pending = computed(
    () =>
      access.pending.value ||
      kitchenSource.outcome.value === 'pending' ||
      (placeIds.value.length > 0 && placeSource.outcome.value === 'pending')
  )
  const error = computed(
    () =>
      access.error.value ?? kitchenSource.error.value ?? placeSource.error.value
  )

  return {
    kitchens,
    count: computed(() => kitchens.value.length),
    pending,
    error,
    outcome: computed(() => {
      if (!enabled.value) return 'idle'
      if (pending.value) return 'pending'
      if (error.value) return 'error'
      return kitchens.value.length
        ? 'ready'
        : kitchenIds.value.length
          ? 'missing'
          : 'empty'
    }),
  }
}
