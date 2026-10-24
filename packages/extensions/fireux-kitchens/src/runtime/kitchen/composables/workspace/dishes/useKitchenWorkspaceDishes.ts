import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenDishCollection } from '../../useKitchenDishCollection'
import { DishStorage, type Dish } from '../../../utils/dish'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'

export function useKitchenWorkspaceDishes() {
  const workspace = useKitchenWorkspace()
  const session = useAppSession()
  const access = useKitchenAccess()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
  const storageKitchenId = computed(() =>
    workspace.outcome.value === 'ready' &&
    selectedKitchen.value?.id === kitchenId.value
      ? kitchenId.value
      : ''
  )
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const source = useKitchenDishCollection(storageKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const outcome = computed(() => {
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (!kitchenId.value) return 'idle'
    if (!storageKitchenId.value) return 'pending'
    return source.outcome.value
  })
  const error = computed(() => {
    if (workspace.outcome.value !== 'ready')
      return workspace.outcome.value === 'error'
        ? session.error.value ||
            access.error.value ||
            new Error('Kitchen could not be loaded.')
        : undefined
    if (!kitchenId.value) return undefined
    return storageKitchenId.value ? source.error.value : undefined
  })
  const pending = computed(() => outcome.value === 'pending')
  const dishes = computed(() =>
    outcome.value === 'ready' ? source.dishes.value : []
  )
  const readOnly = computed(
    () =>
      !(
        workspace.outcome.value === 'ready' &&
        storageKitchenId.value &&
        access.ids.value.includes(kitchenId.value)
      )
  )
  const page = useKitchenWorkspaceReadPage<Dish>({
    collectionName: DishStorage.collection,
    selectedKitchen,
    kitchenId,
    items: dishes,
    pending,
    collectionPath: source.collectionPath,
  })
  return {
    ...page,
    selectedKitchen,
    kitchenId,
    storageKitchenId,
    collectionPath: source.collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    dishes,
    pending,
    error,
    outcome,
  }
}
