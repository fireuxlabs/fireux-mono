import type { PublicKitchenPromotion } from '../../kitchen/models/promotion.model'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { KitchenPublicOffering } from '../../kitchen/models/public-offering.model'
import type { CurrencyDisplayFormat } from '../../models/shared/currency-display.model.ts'
import type {
  SproochliDefaultLanguage,
  SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'
import type { MenuBrowseSurfaceCopy } from '../utils/menu-surface-copy'
import type { KitchenImageShade } from '../../kitchen/models/kitchen-configuration.model.ts'
import type { DishItemKind } from '../../kitchen/utils/dish.ts'
import type {
  MenuChoice,
  MenuOrderingConfig,
  MenuOfferingProfile,
} from './menu-ordering.model'

export type MenuManifestPriceOption = {
  id: string
  label: string
  price: number
  priceLabel: string
}

export type MenuManifestAddOn = {
  id: string
  label: string
  price: number
  priceLabel: string
}

export type MenuManifestItem = {
  promotionLabel?: string
  id: string
  dishId: string
  itemKind: DishItemKind
  isDeal: boolean
  name: string
  description: string
  imageUrl: string
  price: number
  priceLabel: string
  priceOptions: MenuManifestPriceOption[]
  addOns: MenuManifestAddOn[]
}

export type MenuManifestSection = {
  id: string
  label: string
  items: MenuManifestItem[]
}

export type MenuManifestContent = {
  promotions?: PublicKitchenPromotion[]
  audience?: 'private_link' | 'protected_group'
  id: string
  name: string
  description: string
  daily?: {
    date: string
    timezone: string
    nextChangeAt: number
    refreshAfterMs: number
    published: boolean
  }
  sections: MenuManifestSection[]
}

export type MenuManifestBehaviour = MenuOfferingProfile

export type MenuKitchenPresentation = {
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  kitchenImageShade?: KitchenImageShade
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenMediaBackdropColor?: string
  kitchenName: string
  kitchenTagline?: string
  kitchenWordmarkImageUrl?: string
  placeLogoImageUrl?: string
  placeWordmarkImageUrl?: string
  theme: WorkspaceTheme
  themeSource: 'menu' | 'kitchen' | 'default'
}

export type MenuManifestPresentation = MenuKitchenPresentation & {
  currencyCode: string
}

export type MenuManifestSource = {
  appId: string
  kitchenId: string
  menuId: string
  kitchenSlug: string
  menuSlug?: string
}

export type MenuManifestSproochli = {
  state: 'default' | 'translated' | 'unavailable'
  language: SproochliLanguageCode
  defaultLanguage: SproochliDefaultLanguage
  readyLanguages: SproochliLanguageCode[] | null
  surfaceCopy: MenuBrowseSurfaceCopy
}

export type MenuManifest = {
  content: MenuManifestContent
  behaviour: MenuManifestBehaviour
  presentation: MenuManifestPresentation
  source: MenuManifestSource
  sproochli?: MenuManifestSproochli
}

export type MenuDocumentFileKind = 'photo' | 'pdf' | 'document'

export type MenuDocumentPayload = MenuKitchenPresentation & {
  audience?: 'private_link' | 'protected_group'
  offerings?: KitchenPublicOffering[]
  id: string
  name: string
  description: string
  fileKind: MenuDocumentFileKind
  file?: {
    url?: string
    name?: string
    type?: string
    storage_path?: string
  }
}

export type MenuDetailPayload =
  | {
      kind: 'document'
      document: MenuDocumentPayload
    }
  | {
      kind: 'manifest'
      manifest: MenuManifest
    }

export type MenuDetailOrderingSource = {
  ordering?: MenuOrderingConfig
  choices?: MenuChoice[]
}
