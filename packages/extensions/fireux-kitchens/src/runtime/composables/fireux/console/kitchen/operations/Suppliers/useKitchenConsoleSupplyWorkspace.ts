import {
  useSupplierConsoleDemoData,
  type SupplierConsoleDemoScenario,
} from 'fireux-suppliers/runtime/composables/fireux/console/supplier/core/useSupplierConsoleDemoData'
import type {
  SupplierIngredient,
  SupplierItem,
} from 'fireux-suppliers/runtime/models/supplier/Supplier.model'
import { computed } from 'vue'
import type { Ingredient } from '../../../../../../models/ingredient.model'
import type { KitchenIngredient } from '../../../../../../models/kitchen/ingredient.model'
import type { KitchenSupplierIngredient } from '../../../../../../models/kitchen/supplier-ingredient.model'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'
import { useKitchenConsole } from '../../core/useKitchenConsole'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenConsoleSupplyLine = {
  ingredient: Ingredient
  kitchenIngredient: KitchenIngredient
  link: KitchenSupplierIngredient
  supplierScenario: SupplierConsoleDemoScenario
  supplierIngredient: SupplierIngredient
  supplierItem: SupplierItem
}

export function useKitchenConsoleSupplyWorkspace() {
  const { selection, runtime } = useKitchenConsole()
  const active = computed(() => runtime.source.value === 'demo')
  const kitchenDemo = useKitchenConsoleDemoData(active)
  const supplierDemo = useSupplierConsoleDemoData(active)
  const scenario = computed(() =>
    findKitchenConsoleDemoScenario(
      kitchenDemo.data.value,
      selection.kitchenId.value
    )
  )
  const selectedSupplierIds = computed(() =>
    new Set(
      (scenario.value?.supplierIngredientLinks ?? [])
        .map(link => clean(link.supplier_id))
        .filter(Boolean)
    )
  )
  const supplierScenarios = computed(() =>
    (supplierDemo.data.value?.scenarios ?? []).filter(supplierScenario =>
      selectedSupplierIds.value.has(clean(supplierScenario.supplier.id))
    )
  )
  const supplierScenarioById = computed(() =>
    new Map(
      supplierScenarios.value.map(supplierScenario => [
        clean(supplierScenario.supplier.id),
        supplierScenario,
      ])
    )
  )
  const ingredientById = computed(() =>
    new Map(
      (scenario.value?.ingredients ?? []).map(ingredient => [
        clean(ingredient.id),
        ingredient,
      ])
    )
  )
  const kitchenIngredientById = computed(() =>
    new Map(
      (scenario.value?.kitchenIngredients ?? []).map(ingredient => [
        clean(ingredient.ingredient_id),
        ingredient,
      ])
    )
  )

  const resolveLine = (
    link: KitchenSupplierIngredient
  ): KitchenConsoleSupplyLine | null => {
    const ingredientId = clean(link.ingredient_id)
    const supplierId = clean(link.supplier_id)
    const ingredient = ingredientById.value.get(ingredientId)
    const kitchenIngredient = kitchenIngredientById.value.get(ingredientId)
    const supplierScenario = supplierScenarioById.value.get(supplierId)
    if (!ingredient || !kitchenIngredient || !supplierScenario) return null

    const supplierIngredients = supplierScenario.ingredients.filter(
      item =>
        item.active !== false &&
        clean(item.ingredient_id) === ingredientId &&
        clean(item.supplier_id) === supplierId
    )
    if (supplierIngredients.length !== 1) return null

    const supplierIngredient = supplierIngredients[0]
    if (!supplierIngredient) return null
    const preferredProductId = clean(supplierIngredient.preferred_product_id)
    if (!preferredProductId) return null

    const offers = supplierScenario.items.filter(
      item =>
        item.active !== false &&
        item.availability_state !== 'unavailable' &&
        clean(item.ingredient_id) === ingredientId &&
        clean(item.product_id) === preferredProductId &&
        clean(item.supplier_id) === supplierId &&
        Number(item.quantity_per_pack) > 0 &&
        Number(item.pack_cost_minor) > 0 &&
        /^[A-Z]{3}$/.test(clean(item.currency_code))
    )
    if (offers.length !== 1) return null

    const supplierItem = offers[0]
    if (!supplierItem) return null

    return {
      ingredient,
      kitchenIngredient,
      link,
      supplierScenario,
      supplierIngredient,
      supplierItem,
    }
  }

  const supplyLines = computed<KitchenConsoleSupplyLine[]>(() =>
    (scenario.value?.supplierIngredientLinks ?? [])
      .map(resolveLine)
      .filter((line): line is KitchenConsoleSupplyLine => Boolean(line))
  )
  const supplyLineByIngredientId = computed(() =>
    new Map(
      supplyLines.value.map(line => [
        clean(line.ingredient.id),
        line,
      ])
    )
  )
  const unresolvedLinks = computed(() => {
    const resolvedIds = new Set(supplyLines.value.map(line => clean(line.link.id)))
    return (scenario.value?.supplierIngredientLinks ?? []).filter(
      link => !resolvedIds.has(clean(link.id))
    )
  })
  const pending = computed(() =>
    active.value && (kitchenDemo.pending.value || supplierDemo.pending.value)
  )

  return {
    active,
    scenario,
    supplierScenarios,
    supplierScenarioById,
    supplyLines,
    supplyLineByIngredientId,
    unresolvedLinks,
    pending,
    supplierDemoError: supplierDemo.error,
  }
}
