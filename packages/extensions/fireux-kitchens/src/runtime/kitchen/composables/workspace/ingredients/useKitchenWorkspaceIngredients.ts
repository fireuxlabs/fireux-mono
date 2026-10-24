import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { IngredientStorage } from '../../../../ingredient/utils/ingredient.ts'
import type { IngredientInterfaceItem } from '../../../../ingredient/composables/useIngredientInterface'
import { useKitchenIngredients } from '../../ingredients/useKitchenIngredients'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'

export function useKitchenWorkspaceIngredients() {
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
  const {
    ingredients,
    pending: sourcePending,
    error: sourceError,
    collectionPath,
  } = useKitchenIngredients(storageKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
    enabled: computed(() => Boolean(storageKitchenId.value)),
  })
  const { outcome: sourceOutcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(storageKitchenId.value)),
    count: computed(() => ingredients.value.length),
    pending: sourcePending,
    error: sourceError,
  })
  const outcome = computed(() => {
    if (!kitchenId.value) return 'idle'
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (!storageKitchenId.value) return 'pending'
    return sourceOutcome.value
  })
  const pending = computed(() => outcome.value === 'pending')
  const loadError = computed(() => {
    if (!kitchenId.value) return undefined
    if (workspace.outcome.value !== 'ready')
      return workspace.outcome.value === 'error'
        ? session.error.value ||
            access.error.value ||
            new Error('Kitchen could not be loaded.')
        : undefined
    return storageKitchenId.value ? sourceError.value : undefined
  })
  const visibleIngredients = computed(() =>
    outcome.value === 'ready' ? ingredients.value : []
  )
  const page = useKitchenWorkspaceReadPage<IngredientInterfaceItem>({
    collectionName: IngredientStorage.collection,
    selectedKitchen,
    kitchenId,
    items: visibleIngredients,
    pending,
    collectionPath,
  })
  const workspaceIngredients = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const kitchenName = computed(() =>
    String(
      selectedKitchen.value?.display_name ||
        selectedKitchen.value?.name ||
        kitchenId.value ||
        ''
    ).trim()
  )

  const canWrite = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      Boolean(storageKitchenId.value) &&
      ['ready', 'empty'].includes(outcome.value) &&
      access.ids.value.includes(kitchenId.value)
  )

  return {
    ...page,
    canWrite,
    readOnly: computed(() => !canWrite.value),
    selectedKitchen,
    kitchenId,
    storageKitchenId,
    outcome,
    collectionPath,
    rootCollection,
    databaseId,
    ingredients: workspaceIngredients,
    count,
    kitchenName,
    pending,
    loadError,
  }
}
