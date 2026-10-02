import type { MenuSection } from '../../../utils/menu-section'
import { useMenuMutation } from './useMenuMutation'

export function useMenuSectionMutations() {
  const { mutate } = useMenuMutation()
  const createSection = async (input: { kitchenId: string; menuId: string; label: string; description?: string; sort_order?: number }) =>
    (await mutate<{ id: string }>('section', 'POST', input)).id
  const updateSection = (kitchenId: string, menuId: string, sectionId: string, changes: Partial<MenuSection>) =>
    mutate('section', 'PATCH', { kitchenId, menuId, sectionId, changes })
  const reorderSections = async (kitchenId: string, menuId: string, orderedIds: string[]) => {
    await Promise.all(orderedIds.map(id => id.trim()).filter(Boolean).map((id, index) => updateSection(kitchenId, menuId, id, { sort_order: index })))
  }
  return { createSection, updateSection, reorderSections,
    archiveSection: (kitchenId: string, menuId: string, sectionId: string) => updateSection(kitchenId, menuId, sectionId, { status: 'archived' }),
  }
}
