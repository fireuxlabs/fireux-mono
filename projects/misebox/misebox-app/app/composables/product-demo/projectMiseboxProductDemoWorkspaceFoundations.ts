import type { Ingredient } from 'fireux-kitchens/runtime/ingredient/utils/ingredient'
import type { KitchenFinanceReportPeriod } from 'fireux-kitchens/runtime/kitchen/models/finance-report.model'

type WorkspaceScenario =
  (typeof import('fireux-kitchens/runtime/kitchen/demo/scenarios'))['deanosKitchenDemoScenario']
type WorkspaceMenuCascade = ReturnType<
  (typeof import('fireux-kitchens/runtime/kitchen/utils/demo-menu-cascade'))['projectKitchenDemoMenuCascade']
>
type FinanceModule =
  typeof import('fireux-kitchens/runtime/kitchen/utils/demo-finance')
type KitchenSpineModule =
  typeof import('fireux-kitchens/runtime/kitchen/utils/kitchen-readers')

const workspaceFinancePeriodLabels = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
} satisfies Record<KitchenFinanceReportPeriod, string>

export async function projectMiseboxProductDemoWorkspaceFoundations({
  workspaceMenuCascade,
  workspaceScenario,
  financeModule,
  kitchenSpineModule,
  loadIngredientRoots,
}: {
  workspaceMenuCascade: WorkspaceMenuCascade
  workspaceScenario: WorkspaceScenario
  financeModule: FinanceModule
  kitchenSpineModule: KitchenSpineModule
  loadIngredientRoots: (ids: string[]) => Promise<Ingredient[]>
}) {
  const workspaceIngredientCascadeById = new Map(
    workspaceMenuCascade.ingredients.map((ingredient) => [
      ingredient.id,
      ingredient,
    ])
  )
  const workspaceTableCount = kitchenSpineModule.readKitchenTableCount(
    workspaceScenario.appSupport
  )
  if (!workspaceTableCount) {
    throw new Error('Product Demo Kitchen Tables are not configured.')
  }
  const workspaceFinance = workspaceScenario.finance
  if (!workspaceFinance) {
    throw new Error('Product Demo Kitchen Finance is not configured.')
  }
  const workspaceFinancePeriods = (
    Object.keys(workspaceFinancePeriodLabels) as KitchenFinanceReportPeriod[]
  ).map((period) => {
    const summary = financeModule.projectKitchenDemoFinanceSummary(
      workspaceFinance,
      period
    )
    return {
      id: period,
      label: workspaceFinancePeriodLabels[period],
      currencyCode: summary.currencyCode,
      minorUnitDigits: summary.minorUnitDigits,
      saleCount: summary.saleCount,
      grossSalesMinor: summary.grossSalesMinor,
      averageSaleMinor: summary.averageSaleMinor,
    }
  })
  const workspaceStations = workspaceScenario.stations
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
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.name.localeCompare(right.name, undefined, {
          sensitivity: 'base',
        })
    )
  const workspaceStationNames = Object.fromEntries(
    workspaceScenario.stations.map((station) => [station.id, station.name])
  )
  const workspaceStationName = (stationId: string) =>
    workspaceStationNames[stationId] || stationId
  const workspaceIngredientIds = [
    ...new Set(
      workspaceScenario.kitchenIngredients
        .map((ingredient) => String(ingredient.ingredient_id || '').trim())
        .filter(Boolean)
    ),
  ].sort()
  const workspaceIngredientRoots = await loadIngredientRoots(
    workspaceIngredientIds
  )
  if (workspaceIngredientRoots.length !== workspaceIngredientIds.length) {
    const resolvedIds = new Set(
      workspaceIngredientRoots.map((ingredient) => ingredient.id)
    )
    throw new Error(
      `Product Demo canonical Ingredients are unresolved: ${workspaceIngredientIds
        .filter((ingredientId) => !resolvedIds.has(ingredientId))
        .join(', ')}`
    )
  }
  const workspaceIngredientRootById = new Map(
    workspaceIngredientRoots.map((ingredient) => [ingredient.id, ingredient])
  )
  const workspaceIngredients = workspaceIngredientIds
    .map((ingredientId) => {
      const ingredient = workspaceIngredientRootById.get(ingredientId)
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
        foodGroup: ingredient.category,
        id: ingredient.id,
        imageUrl,
        menuIds: [
          ...(workspaceIngredientCascadeById.get(ingredient.id)?.menuIds ?? []),
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
    workspaceFinancePeriods,
    workspaceIngredientRoots,
    workspaceIngredients,
    workspaceStationName,
    workspaceStationNames,
    workspaceStations,
    workspaceTableCount,
  }
}
