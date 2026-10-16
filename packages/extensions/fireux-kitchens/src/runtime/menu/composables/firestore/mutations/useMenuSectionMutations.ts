import type { MenuSection } from '../../../utils/menu-section'
import { useMenuMutation } from './useMenuMutation'

export function useMenuSectionMutations() {
  const { mutate } = useMenuMutation()
  const createSection = async (input: {
    kitchenId: string
    menuId: string
    label: string
    description?: string
  }) => (await mutate<{ id: string }>('section', 'POST', input)).id
  const updateSection = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    changes: Partial<MenuSection>
  ) => mutate('section', 'PATCH', { kitchenId, menuId, sectionId, changes })
  const moveSection = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    direction: 'up' | 'down',
    isCurrent: () => boolean
  ) =>
    mutate(
      'display-order',
      'PATCH',
      { kitchenId, menuId, sectionId, direction },
      isCurrent
    )
  return {
    createSection,
    updateSection,
    moveSection,
    archiveSection: (kitchenId: string, menuId: string, sectionId: string) =>
      updateSection(kitchenId, menuId, sectionId, { status: 'archived' }),
  }
}
