import type { FireuxAppScopeState } from 'fireux-core/runtime/models/core/meta.model'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { KitchenFulfilmentConfig } from '../models/kitchen.model'
import { readMenuOrderFulfilmentPolicy } from './menu-ordering-policy'

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
const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map(text).filter(Boolean)
    : []

export const readKitchenAppScope = (
  value: KitchenSpineRecord,
  fallbackAppId: unknown = ''
) => {
  const source = record(value)
  const appScope = record(source.app_scope)
  const state =
    (text(appScope.state) || text(source.app_scope_state)) as FireuxAppScopeState | ''
  const appId = text(appScope.app_id) || text(source.app_scope_app_id) || text(fallbackAppId)

  return {
    state,
    appId,
    hasTenantApp: state === 'dedicated_app' && Boolean(appId),
  }
}

export const readKitchenIdentity = (value: KitchenSpineRecord) => {
  const source = record(value)
  const identity = record(source.identity)
  const displayName =
    text(identity.display_name) ||
    text(source.display_name) ||
    text(source.name) ||
    text(source.short_name)
  const imageUrl =
    text(identity.image_url) ||
    text(source.display_image_url) ||
    text(source.image_url)
  const gallery = stringArray(identity.gallery).length
    ? stringArray(identity.gallery)
    : stringArray(source.food_gallery)

  return {
    displayName,
    tagline: text(identity.tagline) || text(source.tagline),
    imageUrl,
    gallery,
  }
}

export const readKitchenVisibility = (value: KitchenSpineRecord) => {
  const source = record(value)
  const visibility = record(source.visibility)

  return {
    show: bool(visibility.show, bool(source.show, false)),
    active: bool(visibility.active, bool(source.active, true)),
    isTest: bool(visibility.is_test, bool(source.is_test_kitchen, false)),
  }
}

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

export const readKitchenFulfilmentConfig = (
  value: KitchenSpineRecord
): KitchenFulfilmentConfig => {
  const source = record(value)
  const policy = readMenuOrderFulfilmentPolicy(source.fulfilment)

  return {
    delivery_zones: policy?.delivery_zones || [],
    payment_methods: policy?.payment_methods || [],
  }
}
