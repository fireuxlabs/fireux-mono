import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

type MenuPathOptions = {
  kitchenCollectionPath?: string | null | undefined
  kitchenId?: string | null | undefined
  menuId?: string | null | undefined
  sectionId?: string | null | undefined
}

export const menuPath = (options: MenuPathOptions) =>
  resolveKitchenChildCollectionPath({
    kitchenCollectionPath: options.kitchenCollectionPath,
    kitchenId: options.kitchenId,
    collectionName: 'menus',
  })

export const menuSectionsPath = (options: MenuPathOptions) => {
  const menusPath = menuPath(options)
  const menuId = normalizeString(options.menuId)
  return menusPath && menuId ? `${menusPath}/${menuId}/sections` : ''
}

export const menuItemsPath = (options: MenuPathOptions) => {
  const sectionsPath = menuSectionsPath(options)
  const sectionId = normalizeString(options.sectionId)
  return sectionsPath && sectionId ? `${sectionsPath}/${sectionId}/items` : ''
}
