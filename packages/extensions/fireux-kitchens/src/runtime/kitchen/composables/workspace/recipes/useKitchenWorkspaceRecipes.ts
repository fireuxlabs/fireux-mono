import { useKitchenAccess } from '../../useKitchenAccess'
import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useKitchenRecipeCollection } from '../../useKitchenRecipeCollection'
import { RecipeStorage, type Recipe } from '../../../utils/recipe.ts'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

export function useKitchenWorkspaceRecipes() {
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
  const canWrite = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      Boolean(storageKitchenId.value) &&
      access.ids.value.includes(kitchenId.value)
  )
  const readOnly = computed(() => !canWrite.value)
  const fetchKitchenId = computed(() =>
    rootCollection.value && storageKitchenId.value ? storageKitchenId.value : ''
  )
  const {
    recipes: fetchedRecipes,
    error: recipesError,
    outcome: recipesOutcome,
    collectionPath: fetchedCollectionPath,
  } = useKitchenRecipeCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const outcome = computed(() => {
    if (!kitchenId.value) return 'idle'
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (!storageKitchenId.value) return 'pending'
    return recipesOutcome.value
  })
  const error = computed(() => {
    if (!kitchenId.value) return undefined
    if (workspace.outcome.value !== 'ready')
      return workspace.outcome.value === 'error'
        ? session.error.value ||
            access.error.value ||
            new Error('Kitchen could not be loaded.')
        : undefined
    return storageKitchenId.value ? recipesError.value : undefined
  })
  const pending = computed(() => outcome.value === 'pending')
  const workspaceRecipes = computed(() =>
    outcome.value === 'ready' ? fetchedRecipes.value : []
  )
  const collectionPath = fetchedCollectionPath
  const page = useKitchenWorkspaceReadPage<Recipe>({
    collectionName: RecipeStorage.collection,
    selectedKitchen,
    kitchenId,
    items: workspaceRecipes,
    pending,
    collectionPath,
  })
  const count = computed(() => page.collection.value.count)
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: count.value,
    pending: pending.value,
    outcome: outcome.value,
    hasError: Boolean(error.value),
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    storageKitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    recipes: workspaceRecipes,
    count,
    pending,
    error,
    outcome,
    debug,
  }
}
