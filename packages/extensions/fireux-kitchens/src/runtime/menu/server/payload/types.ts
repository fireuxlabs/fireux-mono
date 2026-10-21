import type { MenuRouteContext } from '../../models/menu-context.model.ts'
import type { KitchenImageShade } from '../../../kitchen/models/kitchen-configuration.model.ts'
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
  showItemImages?: boolean
  kitchenOfferingId?: string
  menuContext?: MenuRouteContext
  kitchen_theme?: WorkspaceTheme
  choices?: unknown[]
  sections?: unknown[]
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

export const menuPayloadText = (value: unknown) => String(value ?? '').trim()

export const compactMenuPayloadRecord = <T extends Record<string, unknown>>(
  value: T
) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => Boolean(menuPayloadText(entry)))
  ) as Partial<T>
