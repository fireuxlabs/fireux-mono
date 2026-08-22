import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { MenuStorage } from '../utils/menu.ts'
export const MenuEntity = defineFireuxEntity({ kind: 'entity', name: 'Menu', family: ['menu'], identity: 'root', authority: 'domain-database', appSupport: 'none', root: MenuStorage.root })
