// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: carry resolved Kitchen fulfilment into public payload construction.
import type { MenuRouteContext } from '../../models/menu-context.model.ts'
import type { KitchenFulfilment } from '../../../kitchen/models/fulfilment.model.ts'
import type { KitchenImageShade } from '../../../kitchen/models/kitchen-configuration.model.ts'
// Concurrent edit — 2026-07-20 22:45 CEST — Nitro import repair: resolve the concrete core money model.
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type {
  SproochliAttachmentConfig,
  SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'

export type MenuPayloadScope = {
  daily?: {
    date: string
    timezone: string
    nextChangeAt: number
    refreshAfterMs: number
    published: boolean
  }
  kitchenTimezone?: string
  kitchenId?: string
  kitchenImageShade?: KitchenImageShade
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenMediaBackdropColor?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenTagline?: string
  kitchenWordmarkImageUrl?: string
  placeLogoImageUrl?: string
  placeWordmarkImageUrl?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  kitchenMenuSlug?: string
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  sourceKind?: string
  kitchenOfferingId?: string
  menuContext?: MenuRouteContext
  kitchen_theme?: WorkspaceTheme
  choices?: unknown[]
  sections?: unknown[]
  sourceMenu?: Record<string, unknown>
  fulfilment?: KitchenFulfilment
  kitchen_offerings?: unknown
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
  menu_slug?: string
}

export type MenuPayloadSourceKind = 'doc' | 'menu'

export const menuPayloadText = (value: unknown) => String(value ?? '').trim()

export const compactMenuPayloadRecord = <T extends Record<string, unknown>>(
  value: T
) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => Boolean(menuPayloadText(entry)))
  ) as Partial<T>
