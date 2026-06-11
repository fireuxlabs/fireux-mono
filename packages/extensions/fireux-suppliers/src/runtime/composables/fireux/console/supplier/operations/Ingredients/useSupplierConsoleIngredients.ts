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
    selectedSupplier,
    selectedMode,
    supplierId,
    canWrite,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selectedSupplier.value?.supplier_organization_name)
  )
  const linkedIngredientIds = computed(() =>
    Array.isArray(selectedSupplier.value?.linked_ingredient_ids)
      ? selectedSupplier.value.linked_ingredient_ids
          .map((value) => normalizeString(value))
          .filter(Boolean)
      : []
  )
  const ingredientItems = computed<SupplierIngredientInterfaceItem[]>(() =>
    linkedIngredientIds.value.map((ingredientId) => ({
      id: `${supplierId.value}:${ingredientId}`,
      supplier_id: supplierId.value,
      ingredient_id: ingredientId,
      label: titleFromId(ingredientId),
      path: supplierId.value
        ? `suppliers/${supplierId.value}/ingredients/${ingredientId}`
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
    mode: selectedMode.value,
    supplierId: supplierId.value,
    supplierName: supplierLabel.value,
    ingredientItemsCount: ingredientItems.value.length,
    ingredientIds: linkedIngredientIds.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedSupplier,
    selectedMode,
    supplierId,
    supplierLabel,
    linkedIngredientIds,
    ingredientItems,
    ingredientsTitle,
    ingredientsDescription,
    canWrite,
    debug,
  }
}

export type SupplierConsoleIngredientsState = ReturnType<
  typeof useSupplierConsoleIngredients
>
