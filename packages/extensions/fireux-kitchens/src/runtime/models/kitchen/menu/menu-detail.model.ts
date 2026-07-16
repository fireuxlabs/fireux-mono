import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { KitchenImageShade } from '../../kitchen.model'
import type { DishItemKind } from '../dish.model'
import type { MenuKioskSkin } from './kiosk-skin.model'
import type { MenuChoice, MenuOrderingConfig, MenuServiceProfile } from './menu.model'

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
  id: string
  name: string
  description: string
  sections: MenuManifestSection[]
}

export type MenuManifestBehaviour = MenuServiceProfile

export type MenuKitchenPresentation = {
  currencyCode?: string
  kitchenImageShade?: KitchenImageShade
  kitchenImageUrl?: string
  kitchenLogoImageUrl?: string
  kitchenName: string
  kitchenWordmarkImageUrl?: string
  pageStyle?: Partial<PageStyle>
}

export type MenuManifestPresentation = MenuKitchenPresentation & {
  currencyCode: string
  kioskSkin?: MenuKioskSkin
  kioskSkinId?: string
}

export type MenuManifestSource = {
  appId: string
  kitchenId: string
  menuId: string
  kitchenSlug: string
}

export type MenuManifest = {
  content: MenuManifestContent
  behaviour: MenuManifestBehaviour
  presentation: MenuManifestPresentation
  source: MenuManifestSource
}

export type MenuDocumentFileKind = 'photo' | 'pdf' | 'document'

export type MenuDocumentPayload = MenuKitchenPresentation & {
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
