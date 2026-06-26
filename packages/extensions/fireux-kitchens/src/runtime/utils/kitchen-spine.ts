import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import {
  readConsoleEntityAppScope,
  readConsoleEntityIdentity,
  readConsoleEntityVisibility,
} from 'fireux-core/runtime/utils/consoleEntitySpine'

type KitchenSpineRecord = Record<string, unknown> | null | undefined

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const optionalRecord = (value: unknown): Record<string, unknown> | undefined => {
  const item = record(value)
  return Object.keys(item).length ? item : undefined
}
const bool = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

export const readKitchenMenusConfig = (value: KitchenSpineRecord) => {
  const source = record(value)
  const menus = record(source.menus)
  const style = optionalRecord(menus.style) ?? optionalRecord(source.menu_style)

  return {
    currencyFormat: (
      text(menus.currency_format) ||
      text(source.menu_currency_format) ||
      'dash'
    ) as CurrencyDisplayFormat,
    showCurrency: bool(menus.show_currency, source.menu_show_currency !== false),
    style: style as Partial<PageStyle> | undefined,
    available: source.menu_available !== false,
  }
}

export const readKitchenMenuStyle = (value: KitchenSpineRecord) =>
  readKitchenMenusConfig(value).style

export const readKitchenAppScope = readConsoleEntityAppScope
export const readKitchenIdentity = readConsoleEntityIdentity
export const readKitchenVisibility = readConsoleEntityVisibility
