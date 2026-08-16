import type { MenuSectionLink } from './menu-section-links'

export type MenuCatalogueFamilyId = 'food' | 'drinks'

export type MenuCatalogueFamily = {
  id: MenuCatalogueFamilyId
  label: string
  icon: string
  sections: MenuSectionLink[]
}

export function menuCatalogueFamilies(
  sections: MenuSectionLink[]
): MenuCatalogueFamily[] {
  return [
    {
      id: 'food',
      label: 'Food',
      icon: 'i-lucide-utensils',
      sections: sections.filter(section =>
        section.items.some(item => item.itemKind !== 'drink')
      ),
    },
    {
      id: 'drinks',
      label: 'Drinks',
      icon: 'i-lucide-cup-soda',
      sections: sections.filter(section =>
        section.items.every(item => item.itemKind === 'drink')
      ),
    },
  ].filter(family => family.sections.length) as MenuCatalogueFamily[]
}
