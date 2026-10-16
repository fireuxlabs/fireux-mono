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
    updateItem,
  } = useKitchenWorkspaceMenuSection()
  const captureDishScope = useDishEditorScope(
    [kitchenId, menuId, sectionId],
    () => {}
  )
  const toast = useToastify()
  const savingAvailability = ref('')
  async function setAvailability(row: MenuSectionItemRow, available: boolean) {
    savingAvailability.value = row.id
    try {
      await saveItemPatch(
        row,
        { status: available ? 'active' : 'archived' },
        available ? 'Item available' : 'Item taken off menu'
      )
    } catch (error) {
      toast.add({
        title: 'Could not change availability',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
      })
    } finally {
      savingAvailability.value = ''
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
  async function saveItemPatch(
    row: MenuSectionItemRow,
    patch: Record<string, unknown>,
    title: string
  ) {
    const isCurrent = captureDishScope()
    try {
      await updateItem(
        kitchenId.value,
        menuId.value,
        sectionId.value,
        row.id,
        patch
      )
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
    if (!isCurrent()) return
    toast.add({ title, color: 'success', icon: 'i-lucide-check' })
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
    savingAvailability,
    setAvailability,
    formatItemPrice,
    saveItemPatch,
  }
}
