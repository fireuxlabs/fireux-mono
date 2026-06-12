import { computed } from 'vue'
import { useSupplierConsole } from '../../core/useSupplierConsole'
import type { SupplierIngredientInterfaceItem } from '../../../../firestore/supplier/utils/view/useSupplierIngredientInterface'

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
  const linkedIngredientIds = computed(() =>
    Array.isArray(selection.supplier.value?.linked_ingredient_ids)
      ? selection.supplier.value.linked_ingredient_ids
          .map((value) => normalizeString(value))
          .filter(Boolean)
      : []
  )
  const ingredientItems = computed<SupplierIngredientInterfaceItem[]>(() =>
    linkedIngredientIds.value.map((ingredientId) => ({
      id: `${selection.supplierId.value}:${ingredientId}`,
      supplier_id: selection.supplierId.value,
      ingredient_id: ingredientId,
      label: titleFromId(ingredientId),
      path: selection.supplierId.value
        ? `suppliers/${selection.supplierId.value}/ingredients/${ingredientId}`
        : `suppliers/{supplierId}/ingredients/${ingredientId}`,
    }))
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
    ingredientItemsCount: ingredientItems.value.length,
    ingredientIds: linkedIngredientIds.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
  }))

  return {
    selectedSupplier: selection.supplier,
    supplierId: selection.supplierId,
    supplierLabel,
    linkedIngredientIds,
    ingredientItems,
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
