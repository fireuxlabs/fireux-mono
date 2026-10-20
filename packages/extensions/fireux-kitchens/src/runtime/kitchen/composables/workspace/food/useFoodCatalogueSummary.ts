import { computed, type Ref } from 'vue'
import { useKitchenChildCollection } from '../../useKitchenChildCollection'
import type { Dish } from '../../../models/dish.model'
import type { KitchenPromotion } from '../../../models/promotion.model'
import type { Menu } from '../../../../menu/models/menu.model'
import {
  foodItemSummary,
  foodMenuSummary,
  foodPromotionSummary,
} from '../../../utils/food-catalogue-summary'

export function useFoodCatalogueSummary(
  kitchenId: Ref<string>,
  menus: Ref<Menu[]>,
  menusOutcome: Ref<string>
) {
  const dishes = useKitchenChildCollection<Dish>('dishes', kitchenId, {
    kitchenCollectionPath: 'kitchens',
  })
  const promotions = useKitchenChildCollection<KitchenPromotion>(
    'promotions',
    kitchenId,
    { kitchenCollectionPath: 'kitchens' }
  )
  const settled = (outcome: string) => ['ready', 'empty'].includes(outcome)
  const state = (outcomes: string[]) =>
    outcomes.includes('error')
      ? 'error'
      : outcomes.every(settled)
        ? 'ready'
        : 'pending'
  return computed(() => ({
    items: {
      outcome: state([dishes.outcome.value]),
      ...foodItemSummary(
        settled(dishes.outcome.value) ? dishes.items.value : []
      ),
    },
    menus: {
      outcome: state([menusOutcome.value]),
      ...foodMenuSummary(settled(menusOutcome.value) ? menus.value : []),
    },
    promotions: {
      outcome: state([promotions.outcome.value, dishes.outcome.value]),
      ...foodPromotionSummary(
        settled(promotions.outcome.value) && settled(dishes.outcome.value)
          ? promotions.items.value
          : [],
        settled(dishes.outcome.value) ? dishes.items.value : []
      ),
    },
  }))
}
