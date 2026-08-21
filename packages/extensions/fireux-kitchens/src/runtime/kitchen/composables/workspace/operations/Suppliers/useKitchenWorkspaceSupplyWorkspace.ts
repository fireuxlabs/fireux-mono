import {
  useSupplierWorkspaceDemoData,
  type SupplierWorkspaceDemoScenario,
} from 'fireux-suppliers/runtime/supplier/composables/workspace/core/useSupplierWorkspaceDemoData'
import type {
  SupplierIngredient,
  SupplierItem,
} from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import { computed } from 'vue'
import type { Ingredient } from '../../../../../ingredient/models/ingredient.model.ts'
import type { KitchenIngredient } from '../../../../models/ingredient.model.ts'
import type { KitchenSupplierIngredient } from '../../../../models/supplier-ingredient.model.ts'
import { selectKitchenDemoSupplierScenarios } from '../../../../utils/demo-suppliers'
import {
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../core/useKitchenWorkspaceDemoData'
import { useKitchenWorkspace } from '../../core/useKitchenWorkspace'
import { useKitchenIngredientRoots } from '../Ingredients/fetch/useKitchenIngredientRoots'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenWorkspaceSupplyLine = {
  ingredient: Ingredient
  kitchenIngredient: KitchenIngredient
  link: KitchenSupplierIngredient
  supplierScenario: SupplierWorkspaceDemoScenario
  supplierIngredient: SupplierIngredient
  supplierItem: SupplierItem
}

export function useKitchenWorkspaceSupplyWorkspace() {
  const { selection, runtime } = useKitchenWorkspace()
  const active = runtime.isDemo
  const kitchenDemo = useKitchenWorkspaceDemoData(active)
  const supplierDemo = useSupplierWorkspaceDemoData(active)
  const scenario = computed(() =>
    findKitchenWorkspaceDemoScenario(
      kitchenDemo.data.value,
      selection.kitchenId.value
    )
  )
  const supplierScenarios = computed(() =>
    selectKitchenDemoSupplierScenarios({
      links: scenario.value?.supplierIngredientLinks ?? [],
      supplierScenarios: supplierDemo.data.value?.scenarios ?? [],
    })
  )
  const supplierScenarioById = computed(
    () =>
      new Map(
        supplierScenarios.value.map((supplierScenario) => [
          clean(supplierScenario.supplier.id),
          supplierScenario,
        ])
      )
  )
  const linkedIngredientIds = computed(() =>
    (scenario.value?.kitchenIngredients ?? [])
      .map((ingredient) => clean(ingredient.ingredient_id))
      .filter(Boolean)
  )
  const ingredientRoots = useKitchenIngredientRoots(linkedIngredientIds, {
    enabled: active,
  })
  const ingredientById = ingredientRoots.rootById
  const kitchenIngredientById = computed(
    () =>
      new Map(
        (scenario.value?.kitchenIngredients ?? []).map((ingredient) => [
          clean(ingredient.ingredient_id),
          ingredient,
        ])
      )
  )

  const resolveLine = (
    link: KitchenSupplierIngredient
  ): KitchenWorkspaceSupplyLine | null => {
    const ingredientId = clean(link.ingredient_id)
    const supplierId = clean(link.supplier_id)
    const ingredient = ingredientById.value.get(ingredientId)
    const kitchenIngredient = kitchenIngredientById.value.get(ingredientId)
    const supplierScenario = supplierScenarioById.value.get(supplierId)
    if (!ingredient || !kitchenIngredient || !supplierScenario) return null

    const supplierIngredients = supplierScenario.ingredients.filter(
      (item) =>
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
      (item) =>
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

  const supplyLines = computed<KitchenWorkspaceSupplyLine[]>(() =>
    (scenario.value?.supplierIngredientLinks ?? [])
      .map(resolveLine)
      .filter((line): line is KitchenWorkspaceSupplyLine => Boolean(line))
  )
  const supplyLineByIngredientId = computed(
    () =>
      new Map(
        supplyLines.value.map((line) => [clean(line.ingredient.id), line])
      )
  )
  const unresolvedLinks = computed(() => {
    const resolvedIds = new Set(
      supplyLines.value.map((line) => clean(line.link.id))
    )
    return (scenario.value?.supplierIngredientLinks ?? []).filter(
      (link) => !resolvedIds.has(clean(link.id))
    )
  })
  const pending = computed(
    () =>
      active.value &&
      (kitchenDemo.pending.value ||
        supplierDemo.pending.value ||
        ingredientRoots.pending.value)
  )

  return {
    active,
    scenario,
    ingredientRoots: ingredientRoots.roots,
    ingredientRootById: ingredientRoots.rootById,
    ingredientRootError: ingredientRoots.error,
    supplierScenarios,
    supplierScenarioById,
    supplyLines,
    supplyLineByIngredientId,
    unresolvedLinks,
    pending,
    supplierDemoError: supplierDemo.error,
  }
}
