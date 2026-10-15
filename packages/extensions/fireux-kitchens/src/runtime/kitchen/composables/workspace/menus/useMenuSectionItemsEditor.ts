import { useDishEditorScope } from '../../dish/useDishEditorScope'
import { useMenuRecordNavigation } from './useMenuRecordNavigation'
import { ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
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
    updateDish,
  } = useKitchenWorkspaceMenuSection()
  const { currentUser } = useAuth()
  const adoptedIds = ref<Record<string, string>>({})
  watch(
    [() => currentUser.value?.uid, kitchenId, menuId, sectionId],
    () => {
      adoptedIds.value = {}
    },
    { flush: 'sync' }
  )
  const captureDishScope = useDishEditorScope(
    [kitchenId, menuId, sectionId],
    () => {}
  )
  const boundSellable = (row: MenuSectionItemRow) =>
    row.item.sellable_id || adoptedIds.value[row.id] || ''
  const toast = useToastify()
  const text = (value: unknown) => String(value ?? '').trim()
  const money = (value: unknown) => Number(value)
  const validatePrice = (value: string) => ({
    isValid:
      value.trim() !== '' &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 0,
    message: 'Enter a price of zero or more.',
  })
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
  const validateDishName = (value: string) => ({
    isValid: Boolean(text(value)),
    message: text(value) ? '' : 'Dish name is required.',
  })
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

  async function saveDishPatch(
    row: MenuSectionItemRow,
    patch: Record<string, unknown>,
    title: string
  ) {
    const isCurrent = captureDishScope()
    try {
      await updateDish(row.dishId, patch, { kitchenId: kitchenId.value })
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
    if (!isCurrent()) return
    toast.add({ title, color: 'success', icon: 'i-lucide-check' })
  }

  const saveDishName = (row: MenuSectionItemRow, value: string) =>
    saveDishPatch(row, { name: text(value) }, 'Dish name saved')

  const saveDishDescription = (row: MenuSectionItemRow, value: string) =>
    saveDishPatch(row, { description: text(value) }, 'Dish description saved')

  const saveItemPrice = (row: MenuSectionItemRow, value: string) =>
    saveItemPatch(row, { price: money(value) }, 'Menu price saved')

  const updatePriceOptionsFor =
    (row: MenuSectionItemRow) =>
    (priceOptions: MenuSectionItemRow['priceOptions'], title: string) =>
      saveItemPatch(row, { price_options: priceOptions }, title)

  const updateAddOnsFor =
    (row: MenuSectionItemRow) =>
    (addOns: MenuSectionItemRow['addOns'], title: string) =>
      saveItemPatch(row, { add_ons: addOns }, title)
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
    adoptedIds,
    boundSellable,
    validatePrice,
    savingAvailability,
    setAvailability,
    formatItemPrice,
    validateDishName,
    saveDishName,
    saveDishDescription,
    saveItemPrice,
    updatePriceOptionsFor,
    updateAddOnsFor,
    saveItemPatch,
  }
}
