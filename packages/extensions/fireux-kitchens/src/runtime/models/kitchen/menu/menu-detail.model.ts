import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
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

export type MenuManifestPresentation = {
  currencyCode: string
  kitchenImageUrl?: string
  kitchenName: string
  kitchenWordmarkImageUrl?: string
  kioskSkin?: MenuKioskSkin
  kioskSkinId?: string
  pageStyle?: Partial<PageStyle>
}

export type MenuManifest = {
  content: MenuManifestContent
  behaviour: MenuManifestBehaviour
  presentation: MenuManifestPresentation
}

export type MenuDocumentFileKind = 'photo' | 'pdf' | 'document'

export type MenuDocumentPayload = {
  id: string
  name: string
  description: string
  kitchenName: string
  fileKind: MenuDocumentFileKind
  file?: {
    url?: string
    name?: string
    type?: string
    storage_path?: string
  }
  pageStyle?: Partial<PageStyle>
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
