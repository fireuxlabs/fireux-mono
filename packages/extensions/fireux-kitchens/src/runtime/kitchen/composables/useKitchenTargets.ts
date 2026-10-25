import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useKitchenAccess } from './useKitchenAccess'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../models/kitchen.model.ts'
import type { KitchenSurface } from '../models/kitchen-interface.model'
import { useKitchenInterface } from './useKitchenInterface'

export type UseKitchenTargetsResult = {
  kitchens: ComputedRef<KitchenSurface[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<WorkspaceTargetOutcome>
}

/** Live, membership-bounded Kitchen targets and their Place presentation. */
export function useKitchenTargets(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenTargetsResult {
  const access = useKitchenAccess()
  const { firestoreLoadDocsByIds } = useFirestoreRead()
  const { surface } = useKitchenInterface()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const kitchenIds = computed(() =>
    enabled.value && access.outcome.value === 'ready'
      ? access.ids.value.map((id) => String(id || '').trim()).filter(Boolean)
      : []
  )
  const kitchenSource = firestoreLoadDocsByIds<Kitchen>({
    collectionPath: 'kitchens',
    ids: kitchenIds,
  })
  const placeIds = computed(() =>
    (kitchenSource.docs.value ?? [])
      .filter((kitchen) => kitchenIds.value.includes(kitchen.id || ''))
      .map((kitchen) => String(kitchen.id || '').trim())
      .filter(Boolean)
  )
  const placeSource = firestoreLoadDocsByIds<Place>({
    collectionPath: 'places',
    ids: placeIds,
  })
  const places = computed(
    () =>
      new Map((placeSource.docs.value ?? []).map((place) => [place.id, place]))
  )
  const kitchens = computed<KitchenSurface[]>(() =>
    (access.outcome.value !== 'ready' || pending.value || error.value
      ? []
      : (kitchenSource.docs.value ?? [])
    ).flatMap((kitchen) => {
      if (!kitchenIds.value.includes(kitchen.id || '')) return []
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
      access.pending.value ||
      access.outcome.value === 'pending' ||
      (kitchenIds.value.length > 0 &&
        ['idle', 'pending'].includes(kitchenSource.outcome.value)) ||
      (placeIds.value.length > 0 &&
        ['idle', 'pending'].includes(placeSource.outcome.value))
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
      if (error.value) return 'error'
      if (pending.value) return 'pending'
      if (access.outcome.value !== 'ready' && access.outcome.value !== 'empty')
        return access.outcome.value
      return kitchens.value.length
        ? 'ready'
        : kitchenIds.value.length
          ? 'empty'
          : 'empty'
    }),
  }
}
