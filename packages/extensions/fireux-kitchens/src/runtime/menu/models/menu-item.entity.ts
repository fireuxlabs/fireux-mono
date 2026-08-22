import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { MenuItemStorage } from '../utils/menu-item.ts'
export const MenuItemRecord = defineFireuxEntity({ kind: 'record', name: 'MenuItem', family: 'menu', identity: 'parent-scoped', authority: 'parent', appSupport: 'none', parent: 'MenuSection', scoped: MenuItemStorage.path })
