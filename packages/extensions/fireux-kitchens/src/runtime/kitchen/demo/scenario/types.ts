import type { KitchenDemoFinance } from '../finance'
import type { KitchenDemoDishFinance } from '../operations/Dishes/finance'
import type {
  KitchenDemoDishSpec,
  KitchenDemoMenuItemComponentDelta,
  KitchenDemoMiseRequirement,
  KitchenDemoPrepItem,
  KitchenDemoProductionRecipe,
} from '../production'
import type {
  KitchenDemoIdentity,
  KitchenDemoMenu,
  KitchenDemoScenario,
} from '../core/types'
import type { KitchenDemoMenuMode } from '../../utils/demo-menu-cascade'
import type { KitchenDemoTeamMember } from '../team'
import type {
  KitchenDemoCompletedOrder,
  KitchenDemoService,
} from '../operations/Orders/history'

export type KitchenDemoScenarioInput = {
  identity: KitchenDemoIdentity
  access: KitchenDemoScenario['access']
  kitchen: KitchenDemoScenario['kitchen']
  configuration: KitchenDemoScenario['configuration']
  place: KitchenDemoScenario['place']
  menu: KitchenDemoMenu
  menuModes?: Readonly<Record<string, KitchenDemoMenuMode>>
  additionalMenus?: KitchenDemoMenu[]
  dishSpecs?: KitchenDemoDishSpec[]
  dishFinance?: KitchenDemoDishFinance[]
  finance?: KitchenDemoFinance
  team?: readonly KitchenDemoTeamMember[]
  services?: readonly KitchenDemoService[]
  completedOrders?: readonly KitchenDemoCompletedOrder[]
  kitchenIngredients?: KitchenDemoScenario['kitchenIngredients']
  menuItemComponentDeltas?: KitchenDemoMenuItemComponentDelta[]
  miseRequirements?: KitchenDemoMiseRequirement[]
  orders: KitchenDemoScenario['orders']
  prepItems?: KitchenDemoPrepItem[]
  recipes?: KitchenDemoProductionRecipe[]
  stations: KitchenDemoScenario['stations']
  supplierIngredientLinks?: KitchenDemoScenario['supplierIngredientLinks']
  miseTasks: KitchenDemoScenario['miseTasks']
}

export type KitchenDemoScenarioAssembly = ReturnType<
  typeof import('./assembly').assembleKitchenDemoScenario
>
