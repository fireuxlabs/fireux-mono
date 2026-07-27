import { computed } from 'vue'
import { useSupplierConsole } from '../../core/useSupplierConsole'
import type { SupplierIngredientInterfaceItem } from '../../../../firestore/supplier/utils/view/useSupplierIngredientInterface'
import { useSupplierIngredientCollection } from '../../../../firestore/supplier/fetch/useSupplierIngredientCollection'
import {
  findSupplierConsoleDemoScenario,
  useSupplierConsoleDemoData,
} from '../../core/useSupplierConsoleDemoData'
import { useSupplierIngredientRoots } from './fetch/useSupplierIngredientRoots'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleIngredients() {
  const {
    selection,
    runtime,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selection.supplier.value?.supplier_organization_name)
  )
  const supplierIngredientsEnabled = computed(() =>
    !runtime.isDemo.value
    && Boolean(runtime.rootCollection.value && selection.supplierId.value)
  )
  const {
    collectionPath,
    supplierIngredients: supplierIngredientsFromStore,
    pending: supplierIngredientsPending,
  } = useSupplierIngredientCollection(selection.supplierId, {
    enabled: supplierIngredientsEnabled,
    supplierCollectionPath: runtime.rootCollection,
  })
  const demoData = useSupplierConsoleDemoData(
    runtime.isDemo
  )
  const demoScenario = computed(() => findSupplierConsoleDemoScenario(
    demoData.data.value,
    selection.supplierId.value
  ))
  const supplierIngredients = computed(() =>
    runtime.isDemo.value
      ? demoScenario.value?.ingredients ?? []
      : supplierIngredientsFromStore.value
  )
  const linkedIngredientIds = computed(() =>
    supplierIngredients.value
      .map(ingredient => normalizeString(ingredient.ingredient_id))
      .filter(Boolean)
  )
  const ingredientRoots = useSupplierIngredientRoots(linkedIngredientIds, {
    enabled: computed(() => Boolean(linkedIngredientIds.value.length)),
  })
  const pending = computed(() =>
    runtime.isDemo.value
      ? demoData.pending.value || ingredientRoots.pending.value
      : supplierIngredientsPending.value || ingredientRoots.pending.value
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
        path: selection.supplierId.value
          ? `suppliers/${selection.supplierId.value}/ingredients/${ingredientId}`
          : `suppliers/{supplierId}/ingredients/${ingredientId}`,
      }
    })
  )
  const ingredientsTitle = computed(() =>
    supplierLabel.value ? `${supplierLabel.value} Ingredients` : 'Supplier Ingredients'
  )
  const ingredientsDescription = computed(() =>
    `${ingredientItems.value.length} assigned ingredient${ingredientItems.value.length === 1 ? '' : 's'}`
  )
  const debug = computed(() => ({
    supplierId: selection.supplierId.value,
    supplierName: supplierLabel.value,
    collectionPath: collectionPath.value,
    ingredientItemsCount: ingredientItems.value.length,
    ingredientIds: linkedIngredientIds.value,
    missingRootIngredientIds: ingredientItems.value
      .filter(item => item.missing_root_ingredient)
      .map(item => item.ingredient_id),
    pending: pending.value,
    loadError: Boolean(loadError.value),
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
  }))

  return {
    selectedSupplier: selection.supplier,
    supplierId: selection.supplierId,
    supplierLabel,
    collectionPath,
    supplierIngredients,
    linkedIngredientIds,
    ingredientItems,
    pending,
    loadError,
    ingredientsTitle,
    ingredientsDescription,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    debug,
  }
}

export type SupplierConsoleIngredientsState = ReturnType<
  typeof useSupplierConsoleIngredients
>
