import { computed } from 'vue'
import { SupplierStorage } from '../../../../models/Supplier.model'
import { useSupplierWorkspace } from '../../core/useSupplierWorkspace'
import type { SupplierIngredientInterfaceItem } from '../../../firestore/utils/view/useSupplierIngredientInterface'
import { useSupplierIngredientCollection } from '../../../useSupplierIngredientCollection'
import { useSupplierIngredientRoots } from './fetch/useSupplierIngredientRoots'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierWorkspaceIngredients() {
  const workspace = useSupplierWorkspace()
  const rootCollection = computed(() => SupplierStorage.collection)

  const supplierLabel = computed(() =>
    normalizeString(
      workspace.data.value?.company_place?.short_name ||
        workspace.data.value?.company_place?.name
    )
  )
  const supplierIngredientsEnabled = computed(
    () => Boolean(rootCollection.value && workspace.id.value)
  )
  const {
    collectionPath,
    supplierIngredients: supplierIngredientsFromStore,
    pending: supplierIngredientsPending,
  } = useSupplierIngredientCollection(workspace.id, {
    enabled: supplierIngredientsEnabled,
    supplierCollectionPath: rootCollection,
  })
  const supplierIngredients = supplierIngredientsFromStore
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
  const loadError = ingredientRoots.error
  const ingredientItems = computed<SupplierIngredientInterfaceItem[]>(() =>
    supplierIngredients.value.map((ingredient) => {
      const ingredientId = normalizeString(ingredient.ingredient_id)
      const root = ingredientRoots.rootById.value.get(ingredientId)
      const hydrationUnavailable = Boolean(
        loadError.value || ingredientRoots.pending.value
      )
      return {
        ...ingredient,
        label: root?.name || (hydrationUnavailable ? '' : 'Missing Ingredient'),
        image_url: root?.image_url || '',
        category: root?.category || '',
        root_status: root?.status || (hydrationUnavailable ? '' : 'missing'),
        missing_root_ingredient: !hydrationUnavailable && !root,
        path: workspace.id.value
          ? `suppliers/${workspace.id.value}/ingredients/${ingredientId}`
          : `suppliers/{supplierId}/ingredients/${ingredientId}`,
      }
    })
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
    loadError,
    ingredientsTitle,
    ingredientsDescription,
    debug,
  }
}

export type SupplierWorkspaceIngredientsState = ReturnType<
  typeof useSupplierWorkspaceIngredients
>
