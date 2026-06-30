import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../kitchen/utils/paths/useKitchenChildCollection'
import { MenuItemStorage } from '../../../../../models/kitchen/menu/menu-item.model'
import { MenuSectionStorage } from '../../../../../models/kitchen/menu/menu-section.model'
import { MenuStorage } from '../../../../../models/kitchen/menu/menu.model'

type MenuPathOptions = {
  kitchenCollectionPath?: string | null | undefined
  kitchenId?: string | null | undefined
  menuId?: string | null | undefined
  sectionId?: string | null | undefined
  appId?: string | null | undefined
}

export const scopedMenuPath = (options: MenuPathOptions) =>
  resolveKitchenChildCollectionPath({
    kitchenCollectionPath: options.kitchenCollectionPath,
    kitchenId: options.kitchenId,
    collectionName: MenuStorage.collection,
    appId: options.appId,
  })

export const menuPath = (options: MenuPathOptions = {}) =>
  scopedMenuPath(options)

export const menuSectionsPath = (options: MenuPathOptions) => {
  const menusPath = menuPath(options)
  const menuId = normalizeString(options.menuId)
  return menusPath && menuId ? `${menusPath}/${menuId}/${MenuSectionStorage.collection}` : ''
}

export const menuItemsPath = (options: MenuPathOptions) => {
  const sectionsPath = menuSectionsPath(options)
  const sectionId = normalizeString(options.sectionId)
  return sectionsPath && sectionId ? `${sectionsPath}/${sectionId}/${MenuItemStorage.collection}` : ''
}
