import type { Kitchen } from '../../../models/kitchen.model'
import type { DummyScenario } from '../../../composables/fireux/app/runtime-kitchen/read-only-scenarios/_shared/types'
import {
  readOnlySupplierIngredients,
  readOnlySuppliers,
  type ReadOnlySupplierIngredient,
} from '../packs/suppliers.pack'
import type {
  ReadOnlyKitchenScenario,
  ReadOnlySupplier,
  ReadOnlySupplierIngredientRecord,
} from '../types'

const normalize = (value: unknown) => String(value || '').trim()
const ingredientPrefix = 'ingredient-'

const toMeta = (scenario: DummyScenario): ReadOnlyKitchenScenario['meta'] => {
  const kitchen = (scenario.kitchen ?? {}) as Record<string, unknown>
  const id = normalize(kitchen.id)
  const name = normalize(kitchen.name) || id
  const addressLabel =
    normalize(kitchen.short_address) ||
    normalize(kitchen.formatted_address)
  const imageUrl = normalize(kitchen.image_url)

  return {
    id,
    name,
    address_label: addressLabel,
    image_url: imageUrl,
    mode: 'read-only',
  }
}

const collectScenarioIngredientIds = (scenario: DummyScenario): Set<string> => {
  const ids = new Set<string>()

  for (const value of Object.values(scenario.menuStack?.ingredientIds ?? {})) {
    const id = normalize(value)
    if (id) ids.add(id)
  }

  for (const ingredient of scenario.globalIngredients ?? []) {
    const id = normalize((ingredient as Record<string, unknown>).id)
    if (id) ids.add(id)
  }

  for (const ingredient of scenario.kitchenIngredients ?? []) {
    const row = ingredient as unknown as Record<string, unknown>
    const id = normalize(row.ingredient_id || row.id)
    if (id) ids.add(id)
  }

  return ids
}

const resolveScenarioIngredientId = (
  ingredientId: string,
  availableIngredientIds: Set<string>
): string | null => {
  const normalized = normalize(ingredientId)
  if (!normalized) return null
  if (availableIngredientIds.has(normalized)) return normalized

  if (normalized.startsWith(ingredientPrefix)) {
    const stripped = normalize(normalized.slice(ingredientPrefix.length))
    return stripped && availableIngredientIds.has(stripped) ? stripped : null
  }

  const prefixed = `${ingredientPrefix}${normalized}`
  return availableIngredientIds.has(prefixed) ? prefixed : null
}

const buildReadOnlyScenarioSuppliers = (kitchenId: string): ReadOnlySupplier[] =>
  readOnlySuppliers.map((supplier) => ({
    id: normalize(supplier.id),
    kitchen_id: kitchenId,
    name: normalize(supplier.name),
    short_name: normalize(supplier.short_name || supplier.name),
    image_url: normalize(supplier.image_url),
  }))

const toSupplierIngredientRecord = (
  kitchenId: string,
  row: ReadOnlySupplierIngredient,
  ingredientId: string
): ReadOnlySupplierIngredientRecord => {
  const supplierId = normalize(row.supplier_id)
  const base = {
    id: `si-${kitchenId}-${supplierId}-${ingredientId}`,
    kitchen_id: kitchenId,
    supplier_id: supplierId,
    ingredient_id: ingredientId,
    currency: row.currency,
    price: Number(row.price || 0),
    unit: row.unit,
    pack_size: Number(row.pack_size || 0),
    pack_unit: row.pack_unit,
  } satisfies ReadOnlySupplierIngredientRecord

  return {
    ...base,
    ...(row.lead_days !== undefined ? { lead_days: Number(row.lead_days) } : {}),
    ...(row.min_order !== undefined ? { min_order: Number(row.min_order) } : {}),
    ...(row.note ? { note: normalize(row.note) } : {}),
  }
}

const buildReadOnlyScenarioSupplierIngredients = (
  kitchenId: string,
  availableIngredientIds: Set<string>
): ReadOnlySupplierIngredientRecord[] =>
  readOnlySupplierIngredients
    .map((row) => {
      const resolvedIngredientId = resolveScenarioIngredientId(
        row.ingredient_id,
        availableIngredientIds
      )
      if (!resolvedIngredientId) return null
      return toSupplierIngredientRecord(kitchenId, row, resolvedIngredientId)
    })
    .filter(
      (row): row is ReadOnlySupplierIngredientRecord => Boolean(row)
    )

export const adaptLegacyScenario = (
  scenario: DummyScenario
): ReadOnlyKitchenScenario => {
  const kitchenId = normalize((scenario.kitchen as Record<string, unknown>)?.id)
  const availableIngredientIds = collectScenarioIngredientIds(scenario)
  const menuStack = scenario.menuStack ?? {
    ingredientIds: {},
    stations: [],
    menus: [],
    dishes: [],
    recipes: [],
    miseTasks: [],
  }

  const procurementStack = scenario.procurementStack ?? {
    suppliers: [],
    supplierIngredients: [],
    purchases: [],
  }

  const serviceStack = scenario.serviceStack ?? {
    incomingOrders: [],
  }

  const trainingStack = scenario.trainingStack ?? {
    modules: [],
  }

  const haccpStack = scenario.haccpStack ?? {
    checks: [],
  }

  return {
    meta: toMeta(scenario),
    kitchen: scenario.kitchen as Kitchen,
    globalIngredients: [...(scenario.globalIngredients ?? [])],
    kitchenIngredients: [...(scenario.kitchenIngredients ?? [])],
    teamMembers: [...(scenario.teamMembers ?? [])],
    competencyGroups: [...(scenario.competencyGroups ?? [])],
    stacks: {
      menu: {
        ingredientIds: { ...(menuStack.ingredientIds ?? {}) },
        stations: [...(menuStack.stations ?? [])],
        menus: [...(menuStack.menus ?? [])],
        dishes: [...(menuStack.dishes ?? [])],
        recipes: [...(menuStack.recipes ?? [])],
        miseTasks: [...(menuStack.miseTasks ?? [])],
      },
      procurement: {
        suppliers: buildReadOnlyScenarioSuppliers(kitchenId),
        supplierIngredients: buildReadOnlyScenarioSupplierIngredients(
          kitchenId,
          availableIngredientIds
        ),
        purchases: [...(procurementStack.purchases ?? [])],
      },
      service: {
        incomingOrders: [...(serviceStack.incomingOrders ?? [])],
      },
      training: {
        modules: [...(trainingStack.modules ?? [])],
      },
      haccp: {
        checks: [...(haccpStack.checks ?? [])],
      },
    },
  }
}
