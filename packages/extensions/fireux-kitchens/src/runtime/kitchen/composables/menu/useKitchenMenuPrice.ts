import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import { formatCurrencyAmount } from '../../../utils/currency-display'
import type { KitchenMenuItemRow } from './types'

type MenuItemPriceOptions = {
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
}

const formatPrice = (price: number, options: MenuItemPriceOptions) =>
  formatCurrencyAmount(price, {
    currencyCode: options.currencyCode,
    format: options.currencyFormat,
    showCurrency: options.showCurrency,
  })

const formatOptionUnit = (
  label: string,
  quantity: number,
  unit: string
) => {
  if (label) return label
  if (unit === 'gram') return `${quantity} g`
  if (unit === 'piece') {
    return `${quantity} pc`
  }

  return [quantity, unit].filter(Boolean).join(' ')
}

export const formatKitchenMenuItemPrice = (
  item: KitchenMenuItemRow,
  options: MenuItemPriceOptions
) => {
  if (item.priceLabel) return item.priceLabel

  if (item.priceOptions.length) {
    return item.priceOptions
      .map((option) => {
        const price = formatPrice(option.price, options)
        if (!price) return ''

        return [
          formatOptionUnit(option.label, option.quantity, option.unit),
          price,
        ].filter(Boolean).join(' ')
      })
      .filter(Boolean)
      .join(' / ')
  }

  return formatPrice(item.price, options)
}
