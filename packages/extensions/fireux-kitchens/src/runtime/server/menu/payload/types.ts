// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: carry resolved Kitchen fulfilment into public payload construction.
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import type {
  KitchenFulfilmentConfig,
  KitchenImageShade,
} from '../../../models/kitchen.model'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model'
// Concurrent edit — 2026-07-20 22:45 CEST — Nitro import repair: resolve the concrete core money model.
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model'
import type {
  SproochliAttachmentConfig,
  SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'

export type MenuPayloadScope = {
  kitchenId?: string
  kitchenImageShade?: KitchenImageShade
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenWordmarkImageUrl?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  sourceKind?: string
  menuContext?: MenuRouteContext
  page_style?: Record<string, unknown>
  choices?: unknown[]
  sections?: unknown[]
  sourceMenu?: Record<string, unknown>
  fulfilment?: KitchenFulfilmentConfig
  kitchen_operation_hours?: WeekdayTimeWindowsConfig
  sproochli?: SproochliAttachmentConfig
  sproochliLanguage?: SproochliLanguageCode
}

export type MenuPayloadFile = {
  url?: string
  name?: string
  type?: string
  storage_path?: string
}

export type MenuPayloadSource = {
  app_id?: string
  kitchen_id?: string
  kitchen_slug?: string
  kitchen_name?: string
  menu_id?: string
}

export type MenuPayloadSourceKind = 'doc' | 'menu'

export const menuPayloadText = (value: unknown) =>
  String(value ?? '').trim()

export const compactMenuPayloadRecord = <T extends Record<string, unknown>>(
  value: T
) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) =>
      Boolean(menuPayloadText(entry))
    )
  ) as Partial<T>
