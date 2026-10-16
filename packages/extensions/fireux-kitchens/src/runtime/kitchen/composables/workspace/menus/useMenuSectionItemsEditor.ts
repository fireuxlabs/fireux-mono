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
  } = useKitchenWorkspaceMenuSection()
  const removing = ref('')
  const captureDishScope = useDishEditorScope(
    [kitchenId, menuId, sectionId],
    () => {
      removing.value = ''
    }
  )
  const toast = useToastify()
  async function removeFromMenu(row: MenuSectionItemRow) {
    if (!canWrite.value || removing.value) return
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

  const formatPrice = (price: number) =>
    price
      ? new Intl.NumberFormat('de-CH', {
          style: 'currency',
          currency: currencyCode.value || 'CHF',
        }).format(price)
      : ''
  const formatOptionUnit = (label: string, quantity: number, unit: string) => {
    if (label) return label
    if (unit === 'gram') return `${quantity} g`
    if (unit === 'piece') return `${quantity} pc`

    return [quantity, unit].filter(Boolean).join(' ')
  }
  const formatItemPrice = (row: MenuSectionItemRow) => {
    if (row.priceOptions.length) {
      return row.priceOptions
        .map((option) => {
          const price = formatPrice(option.price)
          if (!price) return ''

          return [
            formatOptionUnit(option.label, option.quantity, option.unit),
            price,
          ]
            .filter(Boolean)
            .join(' ')
        })
        .filter(Boolean)
        .join(' / ')
    }

    return formatPrice(row.price) || 'No price'
  }
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
    removing,
    removeFromMenu,
    formatItemPrice,
  }
}
