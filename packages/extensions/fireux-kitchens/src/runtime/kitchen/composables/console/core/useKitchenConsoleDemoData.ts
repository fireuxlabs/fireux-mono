// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazily adapt owner-local Kitchen fixtures for console use.
// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: expose one coherent typed Kitchen world to read-only Console adapters.
import type { MaybeRefOrGetter } from 'vue'
import {
  useConsoleDemoData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleDemoData'
import {
  useKitchenInterface,
  type KitchenSurface,
} from '../../firestore/utils/view/useKitchenInterface'
import type { KitchenDemoScenario } from '../../../demo/core/types'
import type { Dish } from '../../../models/dish.model.ts'

export type KitchenConsoleDemoScenario = Omit<
  KitchenDemoScenario,
  'kitchen' | 'services' | 'completedOrders'
> & {
  kitchen: KitchenSurface
}

export type KitchenConsoleDemoData = {
  dishRecordsByKitchenId: Readonly<Record<string, readonly Dish[]>>
  kitchens: KitchenSurface[]
  scenarios: KitchenConsoleDemoScenario[]
}

export function useKitchenConsoleDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  const { surface } = useKitchenInterface()

  return useConsoleDemoData<KitchenConsoleDemoData>({
    active,
    loader: async () => {
      const [
        { kitchenDemoScenarios },
        { kitchenDemoDishRecordsByKitchenId },
      ] = await Promise.all([
        import('../../../demo/scenarios'),
        import('../../../demo/operations/Dishes'),
      ])
      const scenarios = kitchenDemoScenarios.reduce<KitchenConsoleDemoScenario[]>(
        (items, scenario) => {
          const kitchen = surface({
            kitchen: scenario.kitchen,
            place: scenario.place,
            scope: scenario.appSupport,
            routeScope: 'demo',
          })
          if (!kitchen) return items

          const menus = scenario.menus.map(menu => ({
            ...menu,
            dishes: [...menu.dishes],
            menuSections: menu.menuSections.map(section => ({
              section: section.section,
              items: [...section.items],
            })),
          }))
          const {
            services: _services,
            completedOrders: _completedOrders,
            ...consoleScenario
          } = scenario

          items.push({
            ...consoleScenario,
            kitchen,
            menus,
            dishes: [...scenario.dishes],
            kitchenIngredients: scenario.kitchenIngredients.map(ingredient => ({
              ...ingredient,
            })),
            supplierIngredientLinks: scenario.supplierIngredientLinks.map(link => ({
              ...link,
            })),
            dishSpecs: scenario.dishSpecs.map(spec => ({
              ...spec,
              assembly: [...spec.assembly],
              components: spec.components.map(component => ({
                ...component,
              })),
            })),
            finance: scenario.finance
              ? {
                  asOfDate: scenario.finance.asOfDate,
                  currencyCode: scenario.finance.currencyCode,
                  timezone: scenario.finance.timezone,
                  dailyGrossSales: scenario.finance.dailyGrossSales.map(
                    day => ({
                      ...day,
                      items: day.items.map(item => ({ ...item })),
                      transactions: day.transactions.map(transaction => ({
                        ...transaction,
                        items: transaction.items.map(item => ({ ...item })),
                      })),
                    })
                  ),
                }
              : null,
            team: scenario.team.map(member => ({ ...member })),
            menuItemComponentDeltas: scenario.menuItemComponentDeltas.map(
              delta => ({
                ...delta,
                choice: { ...delta.choice },
                components: delta.components.map(component => ({
                  ...component,
                })),
              })
            ),
            menuSections: scenario.menuSections.map(section => ({
              section: section.section,
              items: [...section.items],
            })),
            miseRequirements: scenario.miseRequirements.map(requirement => ({
              ...requirement,
              amount: { ...requirement.amount },
              source: { ...requirement.source },
            })),
            miseTasks: [...scenario.miseTasks],
            orders: [...scenario.orders],
            prepItems: scenario.prepItems.map(prepItem => ({
              ...prepItem,
              input: { ...prepItem.input },
              yield: { ...prepItem.yield },
              method: [...prepItem.method],
            })),
            recipes: scenario.recipes.map(recipe => ({
              ...recipe,
              yield: { ...recipe.yield },
              ingredients: recipe.ingredients.map(ingredient => ({
                ...ingredient,
              })),
              method: [...recipe.method],
            })),
            stations: [...scenario.stations],
          })
          return items
        },
        []
      )

      return {
        dishRecordsByKitchenId: kitchenDemoDishRecordsByKitchenId,
        kitchens: scenarios.map((scenario) => scenario.kitchen),
        scenarios,
      }
    },
    isEmpty: (value) => value.kitchens.length === 0,
  })
}

export function findKitchenConsoleDemoDishRecords(
  data: KitchenConsoleDemoData | undefined,
  kitchenId: string
) {
  const id = String(kitchenId ?? '').trim()
  if (!id) return []

  return data?.dishRecordsByKitchenId[id] ?? []
}

export function findKitchenConsoleDemoScenario(
  data: KitchenConsoleDemoData | undefined,
  kitchenId: string
) {
  const id = String(kitchenId ?? '').trim()
  if (!id) return null

  return data?.scenarios.find((scenario) => scenario.kitchen.id === id) ?? null
}

export function findKitchenConsoleDemoMenu(
  scenario: KitchenConsoleDemoScenario | null | undefined,
  menuId: string
) {
  const id = String(menuId ?? '').trim()
  if (!id) return null

  return scenario?.menus.find(
    menu => String(menu.kitchenMenu.id ?? '').trim() === id
  ) ?? null
}
