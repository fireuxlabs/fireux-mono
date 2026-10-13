import type { KitchenOffering } from '../../models/offering.model'
// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: type one coherent read-only Kitchen world across identity, menu and service records.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: preserve Deanos and Garden Room as separate coherent scenarios.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: keep the two named restaurant scenarios distinct.
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Dish } from '../../utils/dish.ts'
import type { KitchenIngredient } from '../../utils/kitchen-ingredient.ts'
import type { KitchenStation } from '../../utils/station.ts'
import type { KitchenSupplierIngredient } from '../../utils/kitchen-supplier-ingredient.ts'
import type { Kitchen } from '../../models/kitchen.model.ts'
import type { KitchenConfiguration } from '../../models/kitchen-configuration.model.ts'
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import type { KitchenMenu } from '../../../menu/utils/kitchen-menu.ts'
import type { MenuItem } from '../../../menu/utils/menu-item.ts'
import type { MenuSection } from '../../../menu/utils/menu-section.ts'
import type { Menu } from '../../../menu/utils/menu.ts'
import type { KitchenDemoFinance } from '../finance'
import type { KitchenDemoTeamMember } from '../team'
import type {
  KitchenDemoCompletedOrder,
  KitchenDemoService,
} from '../operations/Orders/history'
import type { KitchenDemoDishFinance } from '../operations/Dishes/finance'
import type {
  KitchenDemoDishSpec,
  KitchenDemoMenuItemComponentDelta,
  KitchenDemoPrepItem,
  KitchenDemoProductionRecipe,
} from '../production'
import type { KitchenDemoMenuMode } from '../../utils/demo-menu-cascade'

export type KitchenDemoMenuSection = {
  section: MenuSection
  items: MenuItem[]
}

export type KitchenDemoIdentity = {
  appId: string
  kitchenId: string
  kitchenSlug: string
  placeId: string
  menuId: string
  serviceId: string
}

export type KitchenDemoAccess = {
  kitchenId: string
  teamIds: string[]
  operatorIds: string[]
}

/**
 * Authoring bundle for one coherent Demo Menu.
 *
 * Dishes are included here only so the fixture can keep its references
 * together. Workspace operations consume the scenario's operation-level
 * `menus`, `dishes`, and `menuSections` projections instead.
 */
export type KitchenDemoMenu = {
  rootMenu: Menu
  kitchenMenu: KitchenMenu
  dishes: Dish[]
  menuSections: KitchenDemoMenuSection[]
}

export type KitchenDemoScenario = {
  appId: string
  access: KitchenDemoAccess
  kitchen: Kitchen
  configuration: KitchenConfiguration
  offerings: KitchenOffering[]
  fulfilment: KitchenFulfilment
  place: Place
  menus: KitchenDemoMenu[]
  menuModes: Readonly<Record<string, KitchenDemoMenuMode>>
  kitchenIngredients: KitchenIngredient[]
  supplierIngredientLinks: KitchenSupplierIngredient[]
  rootMenu: Menu
  kitchenMenu: KitchenMenu
  dishes: Dish[]
  dishSpecs: KitchenDemoDishSpec[]
  dishFinance: KitchenDemoDishFinance[]
  finance: KitchenDemoFinance | null
  team: readonly KitchenDemoTeamMember[]
  services: readonly KitchenDemoService[]
  completedOrders: readonly KitchenDemoCompletedOrder[]
  menuItemComponentDeltas: KitchenDemoMenuItemComponentDelta[]
  menuSections: KitchenDemoMenuSection[]
  prepItems: KitchenDemoPrepItem[]
  recipes: KitchenDemoProductionRecipe[]
  stations: KitchenStation[]
}

export type KitchenDemoScenarioMaturity = 'operational' | 'presentation'

export type KitchenDemoOperation =
  | 'dishes'
  | 'ingredients'
  | 'menus'
  | 'recipes'
  | 'stations'
  | 'suppliers'
  | 'tables'

export type KitchenDemoPresentation = 'kiosk' | 'menu' | 'service'

/**
 * Explicitly classifies how much of the Kitchen Workspace a scenario proves.
 *
 * This metadata stays separate from the real Kitchen and operation records so
 * Demo maturity never leaks into a canonical model or changes fixture output.
 */
export type KitchenDemoScenarioDescriptor = {
  kitchenId: string
  maturity: KitchenDemoScenarioMaturity
  operationCoverage: readonly KitchenDemoOperation[]
  presentation: readonly KitchenDemoPresentation[]
}
