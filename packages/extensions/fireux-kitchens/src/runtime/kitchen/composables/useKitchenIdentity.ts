import { computed, toValue, type Ref, type MaybeRefOrGetter } from 'vue'
import { useKitchenRead } from './firestore/useKitchenRead'
import { useKitchenInterface } from './useKitchenInterface'
import { useKitchenUpdate } from './firestore/useKitchenUpdate'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenAccess } from './useKitchenAccess'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { KitchenSurface } from '../models/kitchen-interface.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

export function useKitchenIdentity(explicitId: MaybeRefOrGetter<string>) {
  const access = useKitchenAccess()
  const { currentUser } = useAuth()
  const requestedId = computed(() => String(toValue(explicitId) || '').trim())
  const id = computed(() =>
    currentUser.value &&
    ['ready', 'empty'].includes(access.outcome.value) &&
    access.ids.value.includes(requestedId.value)
      ? requestedId.value
      : ''
  )
  const source = useKitchenRead(id)
  const { surface } = useKitchenInterface()
  const data = computed(() =>
    surface({
      kitchen: source.kitchen.value,
      place: source.place.value,
      routeScope: 'live',
    })
  )
  const outcome = computed(() =>
    access.outcome.value === 'pending' ||
    (currentUser.value && access.outcome.value === 'idle')
      ? 'pending'
      : access.outcome.value === 'error'
        ? 'error'
        : source.outcome.value
  )
  const projection = useKitchenIdentityProjection({
    id,
    data,
    outcome,
    place: source.place,
    placeOutcome: source.placeOutcome,
  })
  const updater = useKitchenUpdate()
  return {
    ...projection,
    canWrite: computed(
      () =>
        Boolean(currentUser.value && access.ids.value.includes(id.value)) &&
        outcome.value === 'ready'
    ),
    update: (
      changes: Parameters<
        ReturnType<typeof useKitchenUpdate>['updateKitchen']
      >[0]['changes']
    ) => updater.updateKitchen({ kitchenId: id.value, changes }),
  }
}

/** Project supplied records into Kitchen Identity without acquiring reads or commands. */
export function useKitchenIdentityProjection<T extends KitchenSurface>(source: {
  id: Ref<string>
  data: Ref<T | null | undefined>
  outcome: Ref<ReadOutcome>
  place: Ref<Place | null | undefined>
  placeOutcome: Ref<ReadOutcome>
}) {
  const selectedKitchen = computed(() =>
    source.outcome.value === 'ready' &&
    source.data.value?.id === source.id.value
      ? source.data.value
      : null
  )
  const place = computed(() =>
    selectedKitchen.value &&
    source.placeOutcome.value === 'ready' &&
    source.place.value?.id === source.id.value
      ? source.place.value
      : null
  )
  const record = computed(
    () => selectedKitchen.value as Record<string, unknown> | null
  )
  const identity = computed(
    () => record.value?.presentation as Record<string, unknown> | undefined
  )

  const name = computed(() => normalizeString(identity.value?.display_name))
  const tagline = computed(() => normalizeString(identity.value?.tagline))
  const imageUrl = computed(() => normalizeString(identity.value?.image_url))
  const slug = computed(() => normalizeString(record.value?.slug))
  const address = computed(() =>
    normalizeString(
      record.value?.short_address || record.value?.formatted_address
    )
  )

  return {
    selectedKitchen,
    kitchenId: source.id,
    outcome: source.outcome,
    place,
    placeId: computed(() => (selectedKitchen.value ? source.id.value : '')),
    placeOutcome: source.placeOutcome,
    pending: computed(
      () =>
        source.outcome.value === 'pending' ||
        source.placeOutcome.value === 'pending'
    ),
    currencyCode: computed(() => readPlaceCurrencyCode(place.value)),
    name,
    tagline,
    imageUrl,
    slug,
    address,
  }
}

export type KitchenIdentityState = ReturnType<typeof useKitchenIdentity>
