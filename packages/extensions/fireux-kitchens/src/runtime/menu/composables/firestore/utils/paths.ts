import { normalizeString, resolveKitchenChildCollectionPath } from '../../../../kitchen/utils/kitchen-collection-path'
import { MenuItemStorage } from '../../../utils/menu-item.ts'
import { MenuSectionStorage } from '../../../utils/menu-section.ts'
import { MenuStorage } from '../../../models/menu-storage.model.ts'

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
    collectionName: MenuStorage.scopeCollection,
    appId: options.appId,
  })

export const menuPath = (options: MenuPathOptions = {}) =>
  scopedMenuPath(options)

export const menuSectionsPath = (options: MenuPathOptions) => {
  const menusPath = menuPath(options)
  const menuId = normalizeString(options.menuId)
  return menusPath && menuId
    ? `${menusPath}/${menuId}/${MenuSectionStorage.collection}`
    : ''
}

export const menuItemsPath = (options: MenuPathOptions) => {
  const sectionsPath = menuSectionsPath(options)
  const sectionId = normalizeString(options.sectionId)
  return sectionsPath && sectionId
    ? `${sectionsPath}/${sectionId}/${MenuItemStorage.collection}`
    : ''
}
