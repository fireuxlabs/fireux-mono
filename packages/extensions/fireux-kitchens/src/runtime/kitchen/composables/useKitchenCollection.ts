import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useKitchenAccess } from './useKitchenAccess'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../models/kitchen.model.ts'
import type { KitchenSurface } from '../models/kitchen-interface.model'
import { useKitchenInterface } from './useKitchenInterface'
import { readKitchenDocument } from '../utils/read-kitchen-document'

export type UseKitchenCollectionReturn = {
  access: ReturnType<typeof useKitchenAccess>
  kitchens: ComputedRef<KitchenSurface[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<WorkspaceTargetOutcome>
}

/** Live, membership-bounded Kitchen targets and their Place presentation. */
export function useKitchenCollection(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenCollectionReturn {
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
  const kitchenSource = firestoreLoadDocsByIds<
    Record<string, unknown> & { id: string }
  >({
    collectionPath: 'kitchens',
    ids: kitchenIds,
  })
  const parsed = computed(() => {
    const items: Kitchen[] = []
    if (
      access.outcome.value !== 'ready' ||
      kitchenSource.outcome.value !== 'ready'
    )
      return { items, invalid: false }
    const allowed = new Set(kitchenIds.value)
    for (const record of kitchenSource.docs.value ?? []) {
      if (!allowed.has(record.id)) continue
      const kitchen = readKitchenDocument(record, record.id)
      if (!kitchen) return { items: [], invalid: true }
      items.push(kitchen)
    }
    return { items, invalid: false }
  })
  const placeIds = computed(() =>
    parsed.value.items.map((kitchen) => kitchen.id)
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
      : parsed.value.items
    ).flatMap((kitchen) => {
      const value = surface({
        kitchen: { ...kitchen, can_write: true },
        place: places.value.get(kitchen.id) ?? null,
        routeScope: 'live',
      })
      return value ? [value] : []
    })
  )
  const pending = computed(
    () =>
      enabled.value &&
      (access.pending.value ||
        access.outcome.value === 'pending' ||
        (kitchenIds.value.length > 0 &&
          ['idle', 'pending'].includes(kitchenSource.outcome.value)) ||
        (placeIds.value.length > 0 &&
          ['idle', 'pending'].includes(placeSource.outcome.value)))
  )
  const error = computed(() => {
    if (!enabled.value) return undefined
    if (access.error.value) return access.error.value
    if (access.outcome.value !== 'ready' || !kitchenIds.value.length)
      return undefined
    return (
      kitchenSource.error.value ??
      (parsed.value.invalid
        ? new Error('Kitchen source is invalid.')
        : undefined) ??
      (placeIds.value.length ? placeSource.error.value : undefined)
    )
  })

  return {
    access,
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
      return kitchens.value.length ? 'ready' : 'empty'
    }),
  }
}
