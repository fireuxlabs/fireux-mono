import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenAccess } from '../useKitchenAccess'
import { RecipeStorage, normalizeRecipe } from '../../utils/recipe'

export function useKitchenRecipeDetail(
  requestedKitchenId: MaybeRefOrGetter<string>,
  requestedRecipeId: MaybeRefOrGetter<string>
) {
  const access = useKitchenAccess()
  const kitchenId = computed(() =>
    String(toValue(requestedKitchenId) || '').trim()
  )
  const recipeId = computed(() =>
    String(toValue(requestedRecipeId) || '').trim()
  )
  const storageKitchenId = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(kitchenId.value)
      ? kitchenId.value
      : ''
  )
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const collectionPath = computed(() =>
    storageKitchenId.value && recipeId.value
      ? `kitchens/${storageKitchenId.value}/${RecipeStorage.collection}`
      : ''
  )
  const source = useFirestoreRead({ databaseId }).firestoreFetchDoc<
    Record<string, unknown>
  >(collectionPath, recipeId)
  const outcome = computed(() => {
    if (!kitchenId.value || !recipeId.value) return 'idle'
    if (access.outcome.value === 'pending' || access.outcome.value === 'error')
      return access.outcome.value
    if (!storageKitchenId.value) return 'missing'
    return source.outcome.value
  })
  const recipe = computed(() =>
    outcome.value === 'ready' && source.value
      ? normalizeRecipe(source.value)
      : null
  )
  const canWrite = computed(
    () => outcome.value === 'ready' && Boolean(recipe.value)
  )
  const error = computed(() => access.error.value || source.error.value)
  const pending = computed(() => outcome.value === 'pending')
  return {
    kitchenId,
    recipeId,
    storageKitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    recipe,
    outcome,
    canWrite,
    readOnly: computed(() => !canWrite.value),
    pending,
    error,
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      recipeId: recipeId.value,
      outcome: outcome.value,
    })),
  }
}
