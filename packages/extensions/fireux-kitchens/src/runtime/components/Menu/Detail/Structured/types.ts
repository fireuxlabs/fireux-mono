import type {
  MenuManifest,
} from '../../../../composables/fireux/public/menu/useMenuManifest'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../../composables/fireux/public/menu/useMenuViewMode'
import type {
  MenuFoodAddOn,
  MenuFoodItem,
  MenuFoodOrderItem,
  MenuFoodPriceOption,
  MenuFoodSection,
} from '../../../../models/menu/menu-food.model'

export type { MenuChoiceValue }

// Detail structured spine: food render types live in menu models; this file adds the detail view model.
export type MenuStructuredItem = MenuFoodItem
export type MenuStructuredAddOn = MenuFoodAddOn
export type MenuStructuredPriceOption = MenuFoodPriceOption
export type MenuStructuredOrderItem = MenuFoodOrderItem
export type MenuStructuredSection = MenuFoodSection

export type MenuStructuredView = {
  menu: MenuManifest
  choices: MenuChoiceOption[]
  selectedChoice: MenuChoiceValue
  orderMode: boolean
  quantities: Record<string, number>
  dimmed: boolean
}
