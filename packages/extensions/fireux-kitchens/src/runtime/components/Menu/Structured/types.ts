import type {
  MenuManifestAddOn,
  MenuManifestItem,
  MenuManifestPriceOption,
  MenuManifestSection,
} from '../../../composables/fireux/public/menu/useMenuManifest'

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
