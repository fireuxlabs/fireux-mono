import type {
  MenuManifestAddOn,
  MenuManifestItem,
  MenuManifestPriceOption,
  MenuManifestSection,
} from './menu-detail.model.ts'

// Food menu render model: section/item display reads the menu manifest shape.
export type MenuFoodItem = MenuManifestItem
export type MenuFoodAddOn = MenuManifestAddOn
export type MenuFoodPriceOption = MenuManifestPriceOption
export type MenuFoodSection = MenuManifestSection
export type MenuFoodOrderItem = MenuFoodItem & {
  lineId: string
  addOns?: MenuFoodAddOn[]
  variant?: MenuFoodPriceOption
}
