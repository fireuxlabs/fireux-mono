import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { MenuSectionStorage } from '../utils/menu-section.ts'
export const MenuSectionRecord = defineFireuxEntity({ kind: 'record', name: 'MenuSection', family: 'menu', identity: 'parent-scoped', authority: 'parent', appSupport: 'none', parent: 'KitchenMenu', scoped: MenuSectionStorage.path })
