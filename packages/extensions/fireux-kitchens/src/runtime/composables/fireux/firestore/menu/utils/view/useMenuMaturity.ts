import { computed, type Ref } from 'vue'
import type { Menu } from '../../../../../../models/menu/menu.model'

export type MenuMaturity = 'source' | 'structured' | 'orderable'

export type MenuMaturityState = {
  hasSource: boolean
  hasStructuredItems: boolean
  isOrderable: boolean
  maturity: MenuMaturity
}

const text = (value: unknown) => String(value ?? '').trim()

export function resolveMenuMaturity(input: {
  menu?: Partial<Menu> | null | undefined
  structuredItemsCount?: number
}): MenuMaturityState {
  const menu = input.menu
  const hasSource = Boolean(text(menu?.doc_url))
  const hasStructuredItems = Number(input.structuredItemsCount || 0) > 0
  const isOrderable = hasStructuredItems && menu?.ordering_enabled === true
  const maturity: MenuMaturity = isOrderable
    ? 'orderable'
    : hasStructuredItems
      ? 'structured'
      : 'source'

  return {
    hasSource,
    hasStructuredItems,
    isOrderable,
    maturity,
  }
}

export function useMenuMaturity(
  menu: Ref<Menu | null | undefined>,
  structuredItemsCount: Ref<number>
) {
  const maturity = computed(() =>
    resolveMenuMaturity({
      menu: menu.value,
      structuredItemsCount: structuredItemsCount.value,
    })
  )

  return {
    hasSource: computed(() => maturity.value.hasSource),
    hasStructuredItems: computed(() => maturity.value.hasStructuredItems),
    isOrderable: computed(() => maturity.value.isOrderable),
    maturity: computed(() => maturity.value.maturity),
    menuMaturity: maturity,
  }
}
