import { useDishEditorScope } from '../../dish/useDishEditorScope'
import { useMenuRecordNavigation } from './useMenuRecordNavigation'
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import {
  type MenuSectionItemRow,
  useKitchenWorkspaceMenuSection,
} from './useKitchenWorkspaceMenuSection'

export function useMenuSectionItemsEditor() {
  const { rememberView } = useMenuRecordNavigation()

  const {
    kitchenId,
    menuId,
    menuSlug,
    sectionId,
    section,
    itemRows,
    sectionsPending,
    sectionsError,
    itemsPending,
    itemsError,
    pending,
    canWrite,
    currencyCode,
    removeItem,
    moveItem,
  } = useKitchenWorkspaceMenuSection()
  const moveError = ref('')
  const moving = ref('')
  const removing = ref('')
  const captureDishScope = useDishEditorScope(
    [kitchenId, menuId, sectionId],
    () => {
      removing.value = ''
      moving.value = ''
      moveError.value = ''
    }
  )
  const toast = useToastify()
  async function removeFromMenu(row: MenuSectionItemRow) {
    if (!canWrite.value || removing.value || moving.value) return
    if (
      !window.confirm(
        `Remove "${row.label}" from this Menu section? This keeps it in your catalogue.`
      )
    )
      return
    const isCurrent = captureDishScope()
    removing.value = row.id
    try {
      await removeItem(
        kitchenId.value,
        menuId.value,
        sectionId.value,
        row.id,
        isCurrent
      )
      if (isCurrent())
        toast.add({ title: 'Removed from Menu', color: 'success' })
    } catch (error) {
      if (isCurrent())
        toast.add({
          title: 'Could not remove item',
          description:
            error instanceof Error ? error.message : 'Please try again.',
          color: 'error',
        })
    } finally {
      if (isCurrent()) removing.value = ''
    }
  }

  function canMove(row: MenuSectionItemRow, direction: 'up' | 'down') {
    const index = itemRows.value.findIndex((item) => item.id === row.id)
    return (
      canWrite.value &&
      !moving.value &&
      !removing.value &&
      index >= 0 &&
      (direction === 'up' ? index > 0 : index < itemRows.value.length - 1)
    )
  }
  async function move(row: MenuSectionItemRow, direction: 'up' | 'down') {
    if (!canMove(row, direction)) return
    const isCurrent = captureDishScope()
    moveError.value = ''
    moving.value = row.id
    try {
      await moveItem(
        kitchenId.value,
        menuId.value,
        sectionId.value,
        row.id,
        direction,
        isCurrent
      )
    } catch (error) {
      if (isCurrent())
        moveError.value =
          error instanceof Error
            ? error.message
            : 'Could not change the display order.'
    } finally {
      if (isCurrent()) moving.value = ''
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('de-CH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  return {
    rememberView,
    kitchenId,
    menuId,
    menuSlug,
    sectionId,
    section,
    itemRows,
    sectionsPending,
    sectionsError,
    itemsPending,
    itemsError,
    pending,
    canWrite,
    currencyCode,
    moving,
    moveError,
    canMove,
    move,
    removing,
    removeFromMenu,
    formatPrice,
  }
}
