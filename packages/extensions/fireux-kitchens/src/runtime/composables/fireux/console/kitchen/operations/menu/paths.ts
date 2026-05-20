import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../collections/useKitchenChildCollection'

type MenuPathOptions = {
  kitchenCollectionPath?: string | null | undefined
  kitchenId?: string | null | undefined
  menuId?: string | null | undefined
  sectionId?: string | null | undefined
}

export const kitchenMenusPath = (options: MenuPathOptions) =>
  resolveKitchenChildCollectionPath({
    kitchenCollectionPath: options.kitchenCollectionPath,
    kitchenId: options.kitchenId,
    collectionName: 'menus',
  })

export const kitchenMenuSectionsPath = (options: MenuPathOptions) => {
  const menusPath = kitchenMenusPath(options)
  const menuId = normalizeString(options.menuId)
  return menusPath && menuId ? `${menusPath}/${menuId}/sections` : ''
}

export const kitchenMenuItemsPath = (options: MenuPathOptions) => {
  const sectionsPath = kitchenMenuSectionsPath(options)
  const sectionId = normalizeString(options.sectionId)
  return sectionsPath && sectionId ? `${sectionsPath}/${sectionId}/items` : ''
}
