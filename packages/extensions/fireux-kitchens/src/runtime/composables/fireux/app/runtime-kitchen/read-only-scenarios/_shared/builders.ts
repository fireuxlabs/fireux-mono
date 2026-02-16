import type {
  Ingredient,
  KitchenIngredient as KitchenIngredientDoc,
} from 'fireux-kitchens/runtime/models/ingredient.model'
import {
  Ingredient as IngredientModel,
  KitchenIngredient as KitchenIngredientModel,
} from 'fireux-kitchens/runtime/models/ingredient.model'
import type { Dish as DishDoc } from 'fireux-kitchens/runtime/models/dish.model'
import { Dish as DishModel } from 'fireux-kitchens/runtime/models/dish.model'
import type { Menu as MenuDoc } from 'fireux-kitchens/runtime/models/menu.model'
import { Menu as MenuModel } from 'fireux-kitchens/runtime/models/menu.model'
import type { KitchenMiseTask as KitchenMiseTaskDoc } from 'fireux-kitchens/runtime/models/kitchen-mise.model'
import { KitchenMiseTask as KitchenMiseTaskModel } from 'fireux-kitchens/runtime/models/kitchen-mise.model'

export const buildIngredient = (overrides: Partial<Ingredient>): Ingredient =>
  ({
    ...IngredientModel,
    ...overrides,
  } as Ingredient)

export const buildKitchenIngredient = (params: {
  kitchenId: string
  ingredient: Ingredient
  overrides?: Partial<KitchenIngredientDoc>
}): KitchenIngredientDoc => {
  const { kitchenId, ingredient, overrides } = params
  const ingredientId = String(ingredient.id || '').trim()
  const kitchenIngredientDocId = `k_${kitchenId}__${ingredientId}`

  return {
    ...KitchenIngredientModel,
    ...(overrides ?? {}),
    id: kitchenIngredientDocId,
    kitchen_id: kitchenId,
    ingredient_id: ingredientId,
    name: String(ingredient.name || '').trim(),
    image_url: String(ingredient.image_url || '').trim(),
  } as KitchenIngredientDoc
}

export const buildDish = (params: {
  kitchenId: string
  overrides: Partial<DishDoc>
}): DishDoc =>
  ({
    ...DishModel,
    kitchen_id: params.kitchenId,
    ...params.overrides,
  } as DishDoc)

export const buildMenu = (params: {
  kitchenId: string
  overrides: Partial<MenuDoc>
}): MenuDoc =>
  ({
    ...MenuModel,
    kitchen_id: params.kitchenId,
    ...params.overrides,
  } as MenuDoc)

export const buildMise = (params: {
  kitchenId: string
  overrides: Partial<KitchenMiseTaskDoc>
}): KitchenMiseTaskDoc =>
  ({
    ...KitchenMiseTaskModel,
    kitchen_id: params.kitchenId,
    ...params.overrides,
  } as KitchenMiseTaskDoc)

export const assertAllKitchenIngredientsResolve = (params: {
  scenarioName: string
  kitchenId: string
  kitchenIngredientIds: string[]
  globalIngredientById: Map<string, Ingredient>
}) => {
  const { scenarioName, kitchenId, kitchenIngredientIds, globalIngredientById } = params
  const missing: string[] = []

  for (const ingredientId of kitchenIngredientIds) {
    if (!globalIngredientById.get(String(ingredientId || '').trim())) {
      missing.push(ingredientId)
    }
  }

  if (missing.length) {
    throw new Error(
      `[${scenarioName}] Missing global ingredients for kitchen "${kitchenId}": ${missing.join(', ')}`
    )
  }
}

type ReadOnlyStationsOverride = {
  add?: Array<Record<string, unknown>>
  removeKeys?: string[]
  patchByKey?: Record<string, Partial<Record<string, unknown>>>
}

type ReadOnlyTrainingModulesOverride = {
  add?: Array<Record<string, unknown>>
  removeIds?: string[]
  patchById?: Record<string, Partial<Record<string, unknown>>>
}

type ReadOnlySupplierIngredientsOverride = {
  add?: Array<Record<string, unknown>>
  removeIds?: string[]
  patchById?: Record<string, Partial<Record<string, unknown>>>
}

export const buildReadOnlySuppliers = (kitchenId: string): Array<Record<string, unknown>> => {
  const resolvedKitchenId = String(kitchenId || '').trim()

  return [
    {
      id: 'supplier-butcher-01',
      kitchen_id: resolvedKitchenId,
      name: 'Old Town Butchers',
      kind: 'butcher',
      contact: { email: 'orders@oldtownbutchers.demo', phone: '+41 79 100 0001' },
      lead_time_days: 1,
      notes: 'Core protein supplier.',
      active: true,
    },
    {
      id: 'supplier-produce-01',
      kitchen_id: resolvedKitchenId,
      name: 'Market Greens Co.',
      kind: 'produce',
      contact: { email: 'sales@marketgreens.demo', phone: '+41 79 100 0002' },
      lead_time_days: 2,
      notes: 'Produce, herbs, and daily veg.',
      active: true,
    },
    {
      id: 'supplier-bakery-01',
      kitchen_id: resolvedKitchenId,
      name: 'Sunrise Bakery',
      kind: 'bakery',
      contact: { email: 'hello@sunrisebakery.demo', phone: '+41 79 100 0003' },
      lead_time_days: 1,
      notes: 'Bread and bakery deliveries.',
      active: true,
    },
    {
      id: 'supplier-specialty-01',
      kitchen_id: resolvedKitchenId,
      name: 'Pantry Select',
      kind: 'specialty',
      contact: { email: 'orders@pantryselect.demo', phone: '+41 79 100 0004' },
      lead_time_days: 2,
      notes: 'Specialty pantry and imported dry goods.',
      active: true,
    },
  ]
}

export const buildReadOnlySupplierIngredients = (
  kitchenId: string,
  ingredientIds?: Record<string, string>,
  overrides?: ReadOnlySupplierIngredientsOverride
): Array<Record<string, unknown>> => {
  const resolvedKitchenId = String(kitchenId || '').trim()
  if (!ingredientIds) return []

  const templates = [
    {
      key: 'beefPatty',
      supplier_id: 'supplier-butcher-01',
      pack_size_label: '5 kg case',
      pack_cost_minor: 42000,
      cost_per_unit_minor: 8400,
      unit: 'kg',
    },
    {
      key: 'bacon',
      supplier_id: 'supplier-butcher-01',
      pack_size_label: '2 kg slab',
      pack_cost_minor: 26000,
      cost_per_unit_minor: 13000,
      unit: 'kg',
    },
    {
      key: 'chickenBreast',
      supplier_id: 'supplier-butcher-01',
      pack_size_label: '4 kg box',
      pack_cost_minor: 36000,
      cost_per_unit_minor: 9000,
      unit: 'kg',
    },
    {
      key: 'burgerBuns',
      supplier_id: 'supplier-bakery-01',
      pack_size_label: '48 buns',
      pack_cost_minor: 7200,
      cost_per_unit_minor: 150,
      unit: 'pc',
    },
    {
      key: 'lettuce',
      supplier_id: 'supplier-produce-01',
      pack_size_label: '12 heads',
      pack_cost_minor: 3600,
      cost_per_unit_minor: 300,
      unit: 'head',
    },
    {
      key: 'tomato',
      supplier_id: 'supplier-produce-01',
      pack_size_label: '6 kg crate',
      pack_cost_minor: 7800,
      cost_per_unit_minor: 1300,
      unit: 'kg',
    },
    {
      key: 'whiteOnion',
      supplier_id: 'supplier-produce-01',
      pack_size_label: '5 kg bag',
      pack_cost_minor: 2800,
      cost_per_unit_minor: 560,
      unit: 'kg',
    },
    {
      key: 'potato',
      supplier_id: 'supplier-produce-01',
      pack_size_label: '10 kg sack',
      pack_cost_minor: 5200,
      cost_per_unit_minor: 520,
      unit: 'kg',
    },
    {
      key: 'fryerOil',
      supplier_id: 'supplier-produce-01',
      pack_size_label: '20 L can',
      pack_cost_minor: 16800,
      cost_per_unit_minor: 840,
      unit: 'l',
    },
  ]

  let result: Array<Record<string, unknown>> = []

  for (const template of templates) {
    const ingredient_id = String(ingredientIds?.[template.key] || '').trim()
    if (!ingredient_id) continue
    result.push({
      id: `si-${resolvedKitchenId}-${ingredient_id}`,
      kitchen_id: resolvedKitchenId,
      supplier_id: template.supplier_id,
      ingredient_id,
      pack_size_label: template.pack_size_label,
      pack_cost_minor: template.pack_cost_minor,
      currency_code: 'CHF',
      cost_per_unit_minor: template.cost_per_unit_minor,
      unit: template.unit,
    })
  }

  const remove = new Set((overrides?.removeIds ?? []).map((value) => String(value || '').trim()))
  result = result.filter((entry) => !remove.has(String(entry.id || '').trim()))

  if (overrides?.patchById) {
    result = result.map((entry) => {
      const id = String(entry.id || '').trim()
      const patch = overrides.patchById?.[id]
      if (!patch) return entry
      return {
        ...entry,
        ...patch,
        kitchen_id: resolvedKitchenId,
      }
    })
  }

  for (const extra of overrides?.add ?? []) {
    const ingredientId = String(extra.ingredient_id || '').trim()
    const id = String(extra.id || '').trim() || (ingredientId ? `si-${resolvedKitchenId}-${ingredientId}` : '')
    if (!id) continue
    result.push({
      ...extra,
      id,
      kitchen_id: resolvedKitchenId,
    })
  }

  return result
}

export const buildReadOnlyStations = (
  kitchenId: string,
  overrides?: ReadOnlyStationsOverride
): Array<Record<string, unknown>> => {
  const resolvedKitchenId = String(kitchenId || '').trim()

  const base: Array<Record<string, unknown>> = [
    {
      id: 'station-prep',
      kitchen_id: resolvedKitchenId,
      name: 'Prep',
      key: 'prep',
      description: 'Prep, batching, and station setup.',
      sort_order: 1,
      active: true,
    },
    {
      id: 'station-grill',
      kitchen_id: resolvedKitchenId,
      name: 'Grill',
      key: 'grill',
      description: 'Hot line and grill service.',
      sort_order: 2,
      active: true,
    },
    {
      id: 'station-fryer',
      kitchen_id: resolvedKitchenId,
      name: 'Fryer',
      key: 'fryer',
      description: 'Fryer service and side output.',
      sort_order: 3,
      active: true,
    },
    {
      id: 'station-cold',
      kitchen_id: resolvedKitchenId,
      name: 'Cold',
      key: 'cold',
      description: 'Cold prep, garnish, and salads.',
      sort_order: 4,
      active: true,
    },
    {
      id: 'station-pass',
      kitchen_id: resolvedKitchenId,
      name: 'Pass',
      key: 'pass',
      description: 'Final check, expo, and send.',
      sort_order: 5,
      active: true,
    },
  ]

  const remove = new Set((overrides?.removeKeys ?? []).map((value) => String(value || '').trim()))
  let result = base.filter((station) => !remove.has(String(station.key || '').trim()))

  if (overrides?.patchByKey) {
    result = result.map((station) => {
      const key = String(station.key || '').trim()
      const patch = overrides.patchByKey?.[key]
      if (!patch) return station
      return {
        ...station,
        ...patch,
        kitchen_id: resolvedKitchenId,
      }
    })
  }

  for (const extra of overrides?.add ?? []) {
    const key = String(extra.key || '').trim()
    const id = String(extra.id || '').trim() || (key ? `station-${key}` : '')
    if (!id) continue
    result.push({
      ...extra,
      id,
      key: key || id,
      kitchen_id: resolvedKitchenId,
      active: extra.active ?? true,
    })
  }

  return result
}

export const buildReadOnlyTrainingModules = (
  kitchenId: string,
  overrides?: ReadOnlyTrainingModulesOverride
): Array<Record<string, unknown>> => {
  const resolvedKitchenId = String(kitchenId || '').trim()

  const base: Array<Record<string, unknown>> = [
    {
      id: 'train-core-01',
      kitchen_id: resolvedKitchenId,
      title: 'Food safety + cross-contamination',
      description: 'Core hygiene controls, allergen handling, and surface discipline.',
      status: 'published',
      minutes: 20,
      tags: ['hygiene', 'haccp'],
    },
    {
      id: 'train-core-02',
      kitchen_id: resolvedKitchenId,
      title: 'Opening checklist',
      description: 'Open stations, verify stock, and confirm service readiness.',
      status: 'published',
      minutes: 15,
      tags: ['ops', 'service'],
    },
    {
      id: 'train-core-03',
      kitchen_id: resolvedKitchenId,
      title: 'Closing checklist',
      description: 'Close stations, clean down, and complete safe storage tasks.',
      status: 'published',
      minutes: 15,
      tags: ['ops', 'close'],
    },
    {
      id: 'train-core-04',
      kitchen_id: resolvedKitchenId,
      title: 'Station handover',
      description: 'Run clean handovers between shifts with clear task ownership.',
      status: 'draft',
      minutes: 12,
      tags: ['training', 'service'],
    },
  ]

  const remove = new Set((overrides?.removeIds ?? []).map((value) => String(value || '').trim()))
  let result = base.filter((module) => !remove.has(String(module.id || '').trim()))

  if (overrides?.patchById) {
    result = result.map((module) => {
      const id = String(module.id || '').trim()
      const patch = overrides.patchById?.[id]
      if (!patch) return module
      return {
        ...module,
        ...patch,
        kitchen_id: resolvedKitchenId,
      }
    })
  }

  for (const extra of overrides?.add ?? []) {
    const id = String(extra.id || '').trim()
    if (!id) continue
    result.push({
      ...extra,
      id,
      kitchen_id: resolvedKitchenId,
    })
  }

  return result
}
