import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useKitchenRead } from './firestore/useKitchenRead'
import { useKitchenInterface } from './useKitchenInterface'
import { useKitchenUpdate } from './firestore/useKitchenUpdate'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenAccess } from './useKitchenAccess'
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
  const updater = useKitchenUpdate()
  const record = computed(() => data.value as Record<string, unknown> | null)
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
    selectedKitchen: data,
    kitchenId: id,
    outcome,
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
    name,
    tagline,
    imageUrl,
    slug,
    address,
  }
}

export type KitchenIdentityState = ReturnType<typeof useKitchenIdentity>
