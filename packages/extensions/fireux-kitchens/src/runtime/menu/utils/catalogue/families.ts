import type { MenuSectionLink } from './section-links'

export type MenuCatalogueFamilyId = 'food' | 'drinks' | 'items'

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
      id: 'items',
      label: 'Items',
      icon: 'i-lucide-book-open',
      sections: sections.filter((section) =>
        section.items.some((item) => !item.itemKind)
      ),
    },
    {
      id: 'food',
      label: 'Food',
      icon: 'i-lucide-utensils',
      sections: sections.filter(
        (section) =>
          section.items.every((item) => Boolean(item.itemKind)) &&
          section.items.some((item) => item.itemKind === 'food')
      ),
    },
    {
      id: 'drinks',
      label: 'Drinks',
      icon: 'i-lucide-cup-soda',
      sections: sections.filter((section) =>
        section.items.every((item) => item.itemKind === 'drink')
      ),
    },
  ].filter((family) => family.sections.length) as MenuCatalogueFamily[]
}
