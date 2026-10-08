import type { KitchenOffering } from '../../../kitchen/models/offering.model'
import type { MenuKitchenScope } from './kitchen-scope'

export type MenuOrderingSource = {
  kitchen: Record<string, unknown>
  place: Record<string, unknown>
  offerings: KitchenOffering[]
}

export type ScopedTargetKind = 'tenant-menu' | 'directory-menu'

export type ScopedMenuTarget = {
  orderingSource?: MenuOrderingSource
  kind: ScopedTargetKind
  routeMenuId: string
  sourceMenuId: string
  appId: string
  kitchenId: string
  kitchenSlug: string
  rootKitchenData: Record<string, unknown>
  kitchenData: Record<string, unknown>
  menuData: Record<string, unknown>
  scope: MenuKitchenScope
}

export type RootMenuTarget = {
  orderingSource?: MenuOrderingSource
  kind: 'root-doorway'
  routeMenuId: string
  sourceMenuId: string
  appId: string
  kitchenId: string
  kitchenSlug: string
  rootMenuData: Record<string, unknown>
  sourceMenuData: Record<string, unknown>
  scope: MenuKitchenScope
}

export type MenuTarget = ScopedMenuTarget | RootMenuTarget

export type TenantMenuScope = {
  appId: string
  kitchenId: string
  kitchenSlug: string
  rootKitchenData: Record<string, unknown>
}
