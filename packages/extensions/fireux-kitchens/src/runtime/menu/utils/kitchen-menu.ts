import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { KitchenMenu, MenuOrderContactField } from '../models/kitchen-menu.model'

export type * from '../models/kitchen-menu.model'

export const KitchenMenuStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/menus/{menuId}', collection: 'menus', scopeCollection: 'menus', parent: 'kitchen', idParam: 'menuId', children: { sections: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}', items: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}' } } as const
export const MenuOrderContactFields = ['name', 'phone', 'email'] as const satisfies readonly MenuOrderContactField[]

export const KitchenMenuDefaults: KitchenMenu = {
  id: '', slug: '', name: '', description: '', status: 'draft', sort_order: 0,
  ordering: { enabled: false, order_types: [], service_hours: { inherit_kitchen_operation_hours: true } },
  created: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['created']['by'], app_id: '' as FireuxStamped['created']['app_id'] },
  updated: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['updated']['by'] },
}

export type KitchenMenuCreateInput = Omit<KitchenMenu, 'created' | 'updated'>
export type KitchenMenuUpdateInput = Partial<Omit<KitchenMenu, 'id' | 'slug' | 'created' | 'updated'>>
