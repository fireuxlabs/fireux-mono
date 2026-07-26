import { computed } from 'vue'
import { useSupplierConsole } from '../../core/useSupplierConsole'
import type { SupplierIngredientInterfaceItem } from '../../../../firestore/supplier/utils/view/useSupplierIngredientInterface'
import { useSupplierIngredientCollection } from '../../../../firestore/supplier/fetch/useSupplierIngredientCollection'
import {
  findSupplierConsoleDemoScenario,
  useSupplierConsoleDemoData,
} from '../../core/useSupplierConsoleDemoData'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const titleFromId = (value: string) =>
  value
    .split('-')
    .map((part) => part ? `${part[0]?.toUpperCase()}${part.slice(1)}` : '')
    .join(' ')

export function useSupplierConsoleIngredients() {
  const {
    selection,
    runtime,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selection.supplier.value?.supplier_organization_name)
  )
  const supplierIngredientsEnabled = computed(() =>
    runtime.source.value !== 'demo'
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
    computed(() => runtime.source.value === 'demo')
  )
  const demoScenario = computed(() => findSupplierConsoleDemoScenario(
    demoData.data.value,
    selection.supplierId.value
  ))
  const supplierIngredients = computed(() =>
    runtime.source.value === 'demo'
      ? demoScenario.value?.ingredients ?? []
      : supplierIngredientsFromStore.value
  )
  const pending = computed(() =>
    runtime.source.value === 'demo'
      ? demoData.pending.value
      : supplierIngredientsPending.value
  )
  const linkedIngredientIds = computed(() =>
    supplierIngredients.value
      .map(ingredient => normalizeString(ingredient.ingredient_id))
      .filter(Boolean)
  )
  const ingredientItems = computed<SupplierIngredientInterfaceItem[]>(() =>
    supplierIngredients.value.map((ingredient) => {
      const ingredientId = normalizeString(ingredient.ingredient_id)
      return {
        ...ingredient,
        label: titleFromId(ingredientId),
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
    pending: pending.value,
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
