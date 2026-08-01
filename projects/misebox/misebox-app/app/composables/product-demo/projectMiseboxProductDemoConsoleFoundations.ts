import type { PublicIngredient } from 'fireux-kitchens/runtime/models/ingredient-public.model'
import { resolveIngredientFoodGroup } from 'fireux-kitchens/runtime/models/ingredient-food-group'
import type { KitchenFinanceReportPeriod } from 'fireux-kitchens/runtime/models/kitchen/finance-report.model'

type ConsoleScenario =
  (typeof import('fireux-kitchens/runtime/demo/kitchen/scenarios'))['deanosKitchenDemoScenario']
type ConsoleMenuCascade = ReturnType<
  (typeof import('fireux-kitchens/runtime/utils/kitchen/demo-menu-cascade'))['projectKitchenDemoMenuCascade']
>
type FinanceModule =
  typeof import('fireux-kitchens/runtime/utils/kitchen/demo-finance')
type KitchenSpineModule =
  typeof import('fireux-kitchens/runtime/utils/kitchen-spine')

const consoleFinancePeriodLabels = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
} satisfies Record<KitchenFinanceReportPeriod, string>

export async function projectMiseboxProductDemoConsoleFoundations({
  consoleMenuCascade,
  consoleScenario,
  financeModule,
  kitchenSpineModule,
  loadIngredientRoots,
}: {
  consoleMenuCascade: ConsoleMenuCascade
  consoleScenario: ConsoleScenario
  financeModule: FinanceModule
  kitchenSpineModule: KitchenSpineModule
  loadIngredientRoots: (ids: string[]) => Promise<PublicIngredient[]>
}) {
  const consoleIngredientCascadeById = new Map(
    consoleMenuCascade.ingredients.map(ingredient => [
      ingredient.id,
      ingredient,
    ])
  )
  const consoleTableCount = kitchenSpineModule.readKitchenTableCount(
    consoleScenario.kitchen
  )
  if (!consoleTableCount) {
    throw new Error('Product Demo Kitchen Tables are not configured.')
  }
  const consoleFinance = consoleScenario.finance
  if (!consoleFinance) {
    throw new Error('Product Demo Kitchen Finance is not configured.')
  }
  const consoleFinancePeriods = (
    Object.keys(consoleFinancePeriodLabels) as KitchenFinanceReportPeriod[]
  ).map((period) => {
    const summary = financeModule.projectKitchenDemoFinanceSummary(
      consoleFinance,
      period
    )
    return {
      id: period,
      label: consoleFinancePeriodLabels[period],
      currencyCode: summary.currencyCode,
      minorUnitDigits: summary.minorUnitDigits,
      saleCount: summary.saleCount,
      grossSalesMinor: summary.grossSalesMinor,
      averageSaleMinor: summary.averageSaleMinor,
    }
  })
  const consoleStations = consoleScenario.stations
    .map((station) => {
      const id = String(station.id || '').trim()
      const name = String(station.name || '').trim()
      if (!id || !name) {
        throw new Error('Product Demo Kitchen Station is incomplete.')
      }
      const sortOrder = Number(station.sort_order)
      return {
        id,
        name,
        description: String(station.description || '').trim(),
        active: station.active !== false,
        sortOrder: Number.isFinite(sortOrder)
          ? sortOrder
          : Number.MAX_SAFE_INTEGER,
      }
    })
    .sort((left, right) =>
      left.sortOrder - right.sortOrder
      || left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    )
  const consoleStationNames = Object.fromEntries(
    consoleScenario.stations.map(station => [station.id, station.name])
  )
  const consoleStationName = (stationId: string) =>
    consoleStationNames[stationId] || stationId
  const consoleMiseTaskById = new Map(
    consoleScenario.miseTasks.map(task => [task.id, task])
  )
  const consoleIngredientIds = [
    ...new Set(
      consoleScenario.kitchenIngredients
        .map(ingredient => String(ingredient.ingredient_id || '').trim())
        .filter(Boolean)
    ),
  ].sort()
  const consoleIngredientRoots = await loadIngredientRoots(consoleIngredientIds)
  if (consoleIngredientRoots.length !== consoleIngredientIds.length) {
    const resolvedIds = new Set(
      consoleIngredientRoots.map(ingredient => ingredient.id)
    )
    throw new Error(
      `Product Demo canonical Ingredients are unresolved: ${
        consoleIngredientIds
          .filter(ingredientId => !resolvedIds.has(ingredientId))
          .join(', ')
      }`
    )
  }
  const consoleIngredientRootById = new Map(
    consoleIngredientRoots.map(ingredient => [ingredient.id, ingredient])
  )
  const consoleIngredients = consoleIngredientIds
    .map((ingredientId) => {
      const ingredient = consoleIngredientRootById.get(ingredientId)
      if (!ingredient) {
        throw new Error(
          `Product Demo canonical Ingredient is unresolved: ${ingredientId}`
        )
      }
      const imageUrl = String(ingredient.image_url || '').trim()
      const name = String(ingredient.name || '').trim()
      if (!imageUrl || !name) {
        throw new Error(
          `Product Demo canonical Ingredient presentation is incomplete: ${ingredientId}`
        )
      }

      return {
        foodGroup: resolveIngredientFoodGroup({
          id: ingredient.id,
          category: ingredient.category,
          kind: ingredient.kind,
        }),
        id: ingredient.id,
        imageUrl,
        menuIds: [
          ...(consoleIngredientCascadeById.get(ingredient.id)?.menuIds ?? []),
        ],
        name,
      }
    })
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    )

  return {
    consoleFinancePeriods,
    consoleIngredientRoots,
    consoleIngredients,
    consoleMiseTaskById,
    consoleStationName,
    consoleStationNames,
    consoleStations,
    consoleTableCount,
  }
}
