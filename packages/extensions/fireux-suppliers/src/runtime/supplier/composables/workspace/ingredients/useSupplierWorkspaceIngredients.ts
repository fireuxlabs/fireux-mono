import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import { computed } from 'vue'
import { SupplierStorage } from '../../../models/Supplier.model'
import { useSupplierWorkspace } from '../useSupplierWorkspace'
import { useSupplierDetail } from '../../useSupplierDetail'
import type { SupplierIngredientInterfaceItem } from '../../firestore/utils/view/useSupplierIngredientInterface'
import { useSupplierIngredientCollection } from '../../useSupplierIngredientCollection'
import { useSupplierIngredientRoots } from '../../ingredients/useSupplierIngredientRoots'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierWorkspaceIngredients() {
  const workspace = useSupplierWorkspace()
  const identity = useSupplierDetail(workspace.id)
  const rootCollection = computed(() => SupplierStorage.collection)

  const supplierLabel = computed(() =>
    normalizeString(
      identity.place.value?.short_name || identity.place.value?.name
    )
  )
  const supplierIngredientsEnabled = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      Boolean(rootCollection.value && workspace.id.value)
  )
  const {
    collectionPath,
    supplierIngredients: supplierIngredientsFromStore,
    pending: supplierIngredientsPending,
    error: associationError,
    outcome: associationOutcome,
  } = useSupplierIngredientCollection(workspace.id, {
    enabled: supplierIngredientsEnabled,
    supplierCollectionPath: rootCollection,
  })
  const supplierIngredients = computed(() =>
    workspace.outcome.value === 'ready' && associationOutcome.value === 'ready'
      ? supplierIngredientsFromStore.value
      : []
  )
  const linkedIngredientIds = computed(() =>
    supplierIngredients.value
      .map((ingredient) => normalizeString(ingredient.ingredient_id))
      .filter(Boolean)
  )
  const ingredientRoots = useSupplierIngredientRoots(linkedIngredientIds, {
    enabled: computed(() => Boolean(linkedIngredientIds.value.length)),
  })
  const pending = computed(
    () => supplierIngredientsPending.value || ingredientRoots.pending.value
  )
  const loadError = computed(
    () => associationError.value || ingredientRoots.error.value
  )
  const readError = loadError
  const outcome = computed(() =>
    workspace.outcome.value !== 'ready'
      ? workspace.outcome.value
      : resolveReadOutcome({
          enabled: supplierIngredientsEnabled.value,
          pending:
            associationOutcome.value === 'pending' ||
            ingredientRoots.pending.value,
          failed: Boolean(loadError.value),
          present: supplierIngredients.value.length > 0,
        })
  )
  const ingredientItems = computed<SupplierIngredientInterfaceItem[]>(() =>
    (outcome.value === 'ready' ? supplierIngredients.value : []).map(
      (ingredient) => {
        const ingredientId = normalizeString(ingredient.ingredient_id)
        const root = ingredientRoots.rootById.value.get(ingredientId)
        const hydrationUnavailable = Boolean(
          loadError.value || ingredientRoots.pending.value
        )
        return {
          ...ingredient,
          label:
            root?.name || (hydrationUnavailable ? '' : 'Missing Ingredient'),
          image_url: root?.image_url || '',
          category: root?.category || '',
          root_status: root ? 'active' : hydrationUnavailable ? '' : 'empty',
          missing_root_ingredient: !hydrationUnavailable && !root,
          path: workspace.id.value
            ? `suppliers/${workspace.id.value}/ingredients/${ingredientId}`
            : `suppliers/{supplierId}/ingredients/${ingredientId}`,
        }
      }
    )
  )
  const ingredientsTitle = computed(() =>
    supplierLabel.value
      ? `${supplierLabel.value} Ingredients`
      : 'Supplier Ingredients'
  )
  const ingredientsDescription = computed(
    () =>
      `${ingredientItems.value.length} assigned ingredient${ingredientItems.value.length === 1 ? '' : 's'}`
  )
  const debug = computed(() => ({
    supplierId: workspace.id.value,
    supplierName: supplierLabel.value,
    collectionPath: collectionPath.value,
    ingredientItemsCount: ingredientItems.value.length,
    ingredientIds: linkedIngredientIds.value,
    missingRootIngredientIds: ingredientItems.value
      .filter((item) => item.missing_root_ingredient)
      .map((item) => item.ingredient_id),
    pending: pending.value,
    loadError: Boolean(loadError.value),
  }))

  return {
    selectedSupplier: workspace.data,
    supplierId: workspace.id,
    supplierLabel,
    collectionPath,
    supplierIngredients,
    linkedIngredientIds,
    ingredientItems,
    pending,
    outcome,
    readError,
    loadError,
    ingredientsTitle,
    ingredientsDescription,
    debug,
  }
}

export type SupplierWorkspaceIngredientsState = ReturnType<
  typeof useSupplierWorkspaceIngredients
>
