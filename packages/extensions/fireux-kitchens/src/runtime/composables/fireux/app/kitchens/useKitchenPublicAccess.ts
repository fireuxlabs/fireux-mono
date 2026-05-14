import { computed, type Ref } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useKitchenCollection,
  type KitchenCollectionFilter,
  type KitchenCollectionSource,
} from '../../firestore/kitchen/fetch/useKitchenCollection'

type MaybeRef<T> = T | Ref<T>

type UseKitchenPublicAccessOptions = {
  source?: MaybeRef<KitchenCollectionSource | null | undefined> | null
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenPublicAccess(
  options: UseKitchenPublicAccessOptions = {}
) {
  const user = useUser()
  const { uid } = useAuth()
  const sourceMode = computed<KitchenCollectionSource>(() => {
    const raw = options.source && 'value' in Object(options.source)
      ? (options.source as Ref<KitchenCollectionSource | null | undefined>).value
      : options.source

    if (raw === 'demo') return 'demo'
    if (raw === 'test') return 'test'
    return 'live'
  })
  const userId = computed(() =>
    normalizeString(user.currentUser.value?.id || uid.value)
  )
  const isAdmin = computed(() => user.isAdmin.value === true)
  const managedFilter = computed<KitchenCollectionFilter>(() =>
    userId.value ? { teamId: userId.value } : { ids: [] }
  )
  const allState = useKitchenCollection({
    source: sourceMode,
  })
  const managedState = useKitchenCollection({
    source: 'live',
    filter: managedFilter,
  })
  const managedKitchenIds = computed(
    () =>
      new Set(
        managedState.kitchens.value
          .map((kitchen) => normalizeString(kitchen.id))
          .filter(Boolean)
      )
  )
  const canSeeKitchen = (kitchen: Record<string, unknown>) => {
    if (sourceMode.value !== 'live') return true
    if (kitchen.show === true) return true
    if (isAdmin.value) return true

    return managedKitchenIds.value.has(normalizeString(kitchen.id))
  }
  const kitchens = computed(() =>
    allState.kitchens.value.filter((kitchen) => canSeeKitchen(kitchen))
  )
  const hiddenVisibleKitchenIds = computed(
    () =>
      new Set(
        kitchens.value
          .filter((kitchen) => kitchen.show !== true)
          .map((kitchen) => normalizeString(kitchen.id))
          .filter(Boolean)
      )
  )
  const pending = computed(
    () =>
      allState.pending.value ||
      user.isLoading.value ||
      Boolean(userId.value && managedState.pending.value)
  )

  return {
    kitchens,
    allKitchens: allState.kitchens,
    pending,
    userId,
    isAdmin,
    managedKitchenIds,
    hiddenVisibleKitchenIds,
  }
}
