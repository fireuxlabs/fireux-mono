import type {
  MenuManifestAddOn,
  MenuManifestItem,
  MenuManifestPriceOption,
  MenuManifestSection,
  MenuManifest,
} from '../../../../composables/fireux/public/menu/useMenuManifest'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../../composables/fireux/public/menu/useMenuViewMode'

export type { MenuChoiceValue }

// Structured menu component spine: item/section display types come from useMenuManifest so detail rendering stays aligned with the manifest contract.
export type MenuStructuredItem = MenuManifestItem
export type MenuStructuredAddOn = MenuManifestAddOn
export type MenuStructuredPriceOption = MenuManifestPriceOption
export type MenuStructuredOrderItem = MenuStructuredItem & {
  lineId: string
  addOns?: MenuStructuredAddOn[]
  variant?: MenuStructuredPriceOption
}
export type MenuStructuredSection = MenuManifestSection

export type MenuStructuredBaseLayerView = {
  menu: MenuManifest
  choices: MenuChoiceOption[]
  selectedChoice: MenuChoiceValue
  orderMode: boolean
  orderNotice: string
  quantities: Record<string, number>
  dimmed: boolean
}
