import {
  formatCurrencyAmount,
  type CurrencyDisplayFormat,
} from 'fireux-core/runtime/models/core/money.model'
import type { KitchenPublicMenuItemRow } from './types'

type MenuItemPriceOptions = {
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  languageCode?: string
}

const formatPrice = (price: number, options: MenuItemPriceOptions) =>
  formatCurrencyAmount(price, {
    currencyCode: options.currencyCode,
    format: options.currencyFormat,
    showCurrency: options.showCurrency,
  })

const formatOptionUnit = (
  quantity: number,
  unit: string,
  language?: string
) => {
  if (unit === 'gram') return language === 'de' || !language ? `${quantity} gr` : `${quantity} g`
  if (unit === 'piece') {
    if (language === 'en') return `${quantity} pcs`
    if (language === 'fr') return `${quantity} pieces`
    if (language === 'it') return `${quantity} pz.`
    if (language === 'ar') return `${quantity} قطع`

    return `${quantity} Stk.`
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
          formatOptionUnit(option.quantity, option.unit, options.languageCode),
          price,
        ].filter(Boolean).join(' ')
      })
      .filter(Boolean)
      .join(' / ')
  }

  return formatPrice(item.price, options)
}
