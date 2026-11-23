import type {
  KitchenPromotionInput,
  PublicKitchenPromotion,
} from '../../records/menus/promotions/promotion'
import type {
  PublicMenuItem,
  MenuManifestSection,
} from '../../../menu/models/menu-detail.model'
export const promotionDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const promotionId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= 160 &&
  !value.includes('/') &&
  !['.', '..'].includes(value)

function promotionAmount(value: unknown): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1_000_000 ||
    Math.abs(value * 100 - Math.round(value * 100)) > 0.000001
  )
    throw new Error(
      'Enter a non-negative price with at most two decimal places.'
    )
  return Math.round(value * 100) / 100
}

export function normalizeKitchenPromotion(
  value: unknown,
  referenceField: 'item_id' | 'itemId' = 'item_id'
): KitchenPromotionInput {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid promotion.')
  const data = value as Record<string, unknown>
  const mealDeal = Object.hasOwn(data, 'groups')
  const allowed = [
    'name',
    'status',
    'currency',
    'days',
    ...(mealDeal ? ['price', 'groups'] : ['dishes']),
  ]
  if (
    Object.keys(data).some((key) => !allowed.includes(key)) ||
    typeof data.name !== 'string' ||
    !data.name.trim() ||
    data.name.length > 80 ||
    !['active', 'paused'].includes(String(data.status)) ||
    typeof data.currency !== 'string' ||
    !/^[A-Z]{3}$/.test(data.currency) ||
    !Array.isArray(data.days) ||
    !data.days.length ||
    data.days.some((day) => !promotionDays.includes(day)) ||
    new Set(data.days).size !== data.days.length
  )
    throw new Error('Provide a name, currency and active weekdays.')
  const common = {
    name: data.name.trim(),
    status: data.status as 'active' | 'paused',
    currency: data.currency,
    days: [...data.days],
  }
  if (mealDeal) {
    if (
      !Array.isArray(data.groups) ||
      !data.groups.length ||
      data.groups.length > 10
    )
      throw new Error('Add between one and ten choice groups.')
    const groups = data.groups.map((value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('Invalid choice group.')
      const group = value as Record<string, unknown>
      if (
        Object.keys(group).some(
          (key) => !['id', 'name', 'choose', 'dishes'].includes(key)
        ) ||
        !promotionId(group.id) ||
        typeof group.name !== 'string' ||
        !group.name.trim() ||
        group.name.length > 80 ||
        !Array.isArray(group.dishes) ||
        !group.dishes.length ||
        group.dishes.length > 100 ||
        typeof group.choose !== 'number' ||
        !Number.isInteger(group.choose) ||
        group.choose < 1 ||
        group.choose > group.dishes.length
      )
        throw new Error(
          'Each group needs a name, dishes and a valid number to choose.'
        )
      const dishes = group.dishes.map((value) => {
        if (!value || typeof value !== 'object' || Array.isArray(value))
          throw new Error('Invalid meal-deal choice.')
        const dish = value as Record<string, unknown>
        if (
          Object.keys(dish).some(
            (key) => ![referenceField, 'supplement'].includes(key)
          ) ||
          !promotionId(dish[referenceField])
        )
          throw new Error('Each choice needs a Item and a supplement.')
        return {
          item_id: dish[referenceField],
          supplement: promotionAmount(dish.supplement),
        }
      })
      if (new Set(dishes.map((dish) => dish.item_id)).size !== dishes.length)
        throw new Error('Choose each Item once within a group.')
      return {
        id: group.id,
        name: group.name.trim(),
        choose: group.choose,
        dishes,
      }
    })
    if (new Set(groups.map((group) => group.id)).size !== groups.length)
      throw new Error('Choice groups need unique ids.')
    const result = {
      ...common,
      price: promotionAmount(data.price),
      groups,
    } as KitchenPromotionInput
    if (promotionItemIds(result).length > 100)
      throw new Error('A promotion can reference at most 100 Items.')
    return result
  }
  if (
    !Array.isArray(data.dishes) ||
    !data.dishes.length ||
    data.dishes.length > 100
  )
    throw new Error('Choose between one and 100 promotional dishes.')
  const dishes = data.dishes.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('Invalid promotional dish.')
    const dish = value as Record<string, unknown>
    if (
      Object.keys(dish).some((key) => ![referenceField, 'price'].includes(key)) ||
      !promotionId(dish[referenceField])
    )
      throw new Error('Each promotional dish needs an id and a price.')
    return { item_id: dish[referenceField], price: promotionAmount(dish.price) }
  })
  if (new Set(dishes.map((dish) => dish.item_id)).size !== dishes.length)
    throw new Error('Choose each dish once.')
  return { ...common, dishes } as KitchenPromotionInput
}

/** API inputs use itemId. The stored record uses item_id. */
export function promotionCommandInput(promotion: KitchenPromotionInput) {
  return 'groups' in promotion
    ? {
        ...promotion,
        groups: promotion.groups.map((group) => ({
          ...group,
          dishes: group.dishes.map(({ item_id, supplement }) => ({
            itemId: item_id,
            supplement,
          })),
        })),
      }
    : {
        ...promotion,
        dishes: promotion.dishes.map(({ item_id, price }) => ({
          itemId: item_id,
          price,
        })),
      }
}

export function promotionItemIds(promotion: KitchenPromotionInput): string[] {
  const dishes =
    'groups' in promotion
      ? promotion.groups.flatMap((group) => group.dishes)
      : promotion.dishes
  return [...new Set(dishes.map((dish) => dish.item_id))]
}

export function promotionDay(timezone: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      weekday: 'long',
    })
      .format(now)
      .toLowerCase()
  } catch {
    return ''
  }
}

/** Promotional prices replace base/required-variant prices; extras retain their charges. */
export function promotionPricedItem(
  item: PublicMenuItem,
  promotions: PublicKitchenPromotion[] | undefined,
  day: string
): { item: PublicMenuItem; promotion?: string } {
  if (item.mealDeal) return { item }
  const offer = promotions?.find(
    (offer) =>
      offer.status === 'active' &&
      offer.days.some((value) => value === day) &&
      offer.dishes.some((dish) => dish.itemId === item.itemId)
  )
  const dish = offer?.dishes.find((dish) => dish.itemId === item.itemId)
  if (!offer || !dish) return { item }
  const price = dish.price
  return {
    item: {
      ...item,
      promotionLabel: offer.name,
      price,
      priceLabel: String(price),
      ...(item.choiceGroups !== undefined
        ? {
            choiceGroups: item.choiceGroups.map((group) =>
              group.pricing === 'full'
                ? {
                    ...group,
                    options: group.options.map((option) => ({
                      ...option,
                      price,
                    })),
                  }
                : group
            ),
          }
        : {}),
      priceOptions: item.priceOptions.map((option) => ({
        ...option,
        price,
        priceLabel: String(price),
      })),
    },
    promotion: offer.name,
  }
}
export function promotionPricedSections(
  sections: MenuManifestSection[],
  promotions: PublicKitchenPromotion[] | undefined,
  now = new Date()
) {
  const day = promotions?.length
    ? promotionDay(promotions[0]!.timezone, now)
    : ''
  return sections
    .map((section) => ({
      ...section,
      items: section.items
        .filter(
          (item) =>
            !item.mealDeal ||
            item.mealDeal.days.includes(
              promotionDay(item.mealDeal.timezone, now)
            )
        )
        .map((item) => promotionPricedItem(item, promotions, day).item),
    }))
    .filter((section) => section.items.length)
}
export function promotionsOverlap(
  a: KitchenPromotionInput,
  b: KitchenPromotionInput
) {
  return (
    'dishes' in a &&
    'dishes' in b &&
    a.status === 'active' &&
    b.status === 'active' &&
    a.days.some((day) => b.days.includes(day)) &&
    a.dishes.some((dish) =>
      b.dishes.some((other) => other.item_id === dish.item_id)
    )
  )
}
