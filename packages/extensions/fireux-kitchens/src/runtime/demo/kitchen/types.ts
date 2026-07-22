// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: type one coherent read-only Kitchen world across identity, menu and service records.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: preserve Deanos and Garden Room as separate coherent scenarios.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: keep the two named restaurant scenarios distinct.
import type { Place } from 'fireux-places/runtime/models/place.model'
import type { Dish } from '../../models/kitchen/dish.model'
import type { KitchenMiseTask } from '../../models/kitchen/mise.model'
import type { KitchenOrder } from '../../models/kitchen/order.model'
import type { KitchenStation } from '../../models/kitchen/station.model'
import type { Kitchen } from '../../models/kitchen.model'
import type { KitchenMenu } from '../../models/kitchen/menu/kitchen-menu.model'
import type { MenuItem } from '../../models/kitchen/menu/menu-item.model'
import type { MenuSection } from '../../models/kitchen/menu/menu-section.model'
import type { Menu } from '../../models/kitchen/menu/menu.model'

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

export type KitchenDemoCatalogue = {
  rootMenu: Menu
  kitchenMenu: KitchenMenu
  dishes: Dish[]
  menuSections: KitchenDemoMenuSection[]
}

export type KitchenDemoScenario = {
  appId: string
  kitchen: Kitchen
  place: Place
  rootMenu: Menu
  kitchenMenu: KitchenMenu
  dishes: Dish[]
  menuSections: KitchenDemoMenuSection[]
  orders: KitchenOrder[]
  stations: KitchenStation[]
  miseTasks: KitchenMiseTask[]
}
