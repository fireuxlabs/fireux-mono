// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazily adapt owner-local Kitchen fixtures for console use.
// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: expose one coherent typed Kitchen world to read-only Console adapters.
import type { MaybeRefOrGetter } from 'vue'
import {
  useConsoleDemoData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDemoData'
import {
  useKitchenInterface,
  type KitchenSurface,
} from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenDemoScenario } from '../../../../../demo/kitchen/types'

export type KitchenConsoleDemoScenario = Omit<KitchenDemoScenario, 'kitchen'> & {
  kitchen: KitchenSurface
}

export type KitchenConsoleDemoData = {
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
      const { kitchenDemoScenarios } = await import(
        '../../../../../demo/kitchen/scenarios'
      )
      const scenarios = kitchenDemoScenarios.reduce<KitchenConsoleDemoScenario[]>(
        (items, scenario) => {
          const kitchen = surface({
            kitchen: scenario.kitchen,
            place: scenario.place,
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

          items.push({
            ...scenario,
            kitchen,
            menus,
            dishes: [...scenario.dishes],
            ingredients: scenario.ingredients.map(ingredient => ({
              ...ingredient,
              names: ingredient.names ? { ...ingredient.names } : undefined,
            })),
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
                  grossSales: Object.fromEntries(
                    Object.entries(scenario.finance.grossSales).map(
                      ([period, summary]) => [
                        period,
                        { ...summary },
                      ]
                    )
                  ) as NonNullable<
                    KitchenConsoleDemoScenario['finance']
                  >['grossSales'],
                }
              : null,
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
        kitchens: scenarios.map((scenario) => scenario.kitchen),
        scenarios,
      }
    },
    isEmpty: (value) => value.kitchens.length === 0,
  })
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
