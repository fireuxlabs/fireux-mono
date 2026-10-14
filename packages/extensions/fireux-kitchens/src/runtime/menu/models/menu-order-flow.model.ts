import type { MenuRouteScope } from '../utils/menu-route'
import type { MenuOrderSelection } from './menu-order-selection.model'

export type MenuOrderInput = {
  menuId: string
  context: 'collection' | 'delivery' | 'table'
  routeScope: MenuRouteScope
}
export type CartLine = MenuOrderSelection & {
  key: string
  name: string
  unitPrice: number
}
