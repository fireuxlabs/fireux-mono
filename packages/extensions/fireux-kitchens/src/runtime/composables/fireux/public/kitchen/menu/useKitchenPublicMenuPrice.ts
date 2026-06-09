import {
  formatCurrencyAmount,
  type CurrencyDisplayFormat,
} from 'fireux-core/runtime/models/core/money.model'
import type { KitchenPublicMenuItemRow } from './types'

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
  quantity: number,
  unit: string
) => {
  if (unit === 'gram') return `${quantity} g`
  if (unit === 'piece') {
    return `${quantity} pc`
  }

  return [quantity, unit].filter(Boolean).join(' ')
}

export const formatKitchenPublicMenuItemPrice = (
  item: KitchenPublicMenuItemRow,
  options: MenuItemPriceOptions
) => {
  if (item.priceOptions.length) {
    return item.priceOptions
      .map((option) => {
        const price = formatPrice(option.price, options)
        if (!price) return ''

        return [
          formatOptionUnit(option.quantity, option.unit),
          price,
        ].filter(Boolean).join(' ')
      })
      .filter(Boolean)
      .join(' / ')
  }

  return formatPrice(item.price, options)
}
