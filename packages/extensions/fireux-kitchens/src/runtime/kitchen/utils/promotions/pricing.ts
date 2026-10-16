import type {
  KitchenPromotionInput,
  PublicKitchenPromotion,
} from '../../models/promotion.model'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../menu/models/menu-detail.model'
type PromotionPrice = Pick<
  KitchenPromotionInput,
  'currency' | 'amount_minor' | 'days' | 'section_ids'
> & { label: string }
export const promotionDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export function normalizePromotionPrice(value: unknown): PromotionPrice | null {
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid Menu pricing.')
  const rule = value as Record<string, unknown>
  if (
    Object.keys(rule).some(
      (key) =>
        !['label', 'currency', 'amount_minor', 'days', 'section_ids'].includes(
          key
        )
    ) ||
    typeof rule.label !== 'string' ||
    !rule.label.trim() ||
    rule.label.length > 80 ||
    typeof rule.currency !== 'string' ||
    !/^[A-Z]{3}$/.test(rule.currency) ||
    !Number.isSafeInteger(rule.amount_minor) ||
    Number(rule.amount_minor) <= 0 ||
    Number(rule.amount_minor) > 100_000_000 ||
    !Array.isArray(rule.days) ||
    !rule.days.length ||
    rule.days.some((day) => !promotionDays.includes(day)) ||
    new Set(rule.days).size !== rule.days.length ||
    !Array.isArray(rule.section_ids) ||
    rule.section_ids.length > 100 ||
    rule.section_ids.some(
      (id) =>
        typeof id !== 'string' ||
        !id ||
        id.length > 160 ||
        id.includes('/') ||
        ['.', '..'].includes(id)
    ) ||
    new Set(rule.section_ids).size !== rule.section_ids.length
  )
    throw new Error(
      'Provide a label, currency, valid price, weekdays and Menu sections.'
    )
  return {
    label: rule.label.trim(),
    currency: rule.currency,
    amount_minor: Number(rule.amount_minor),
    days: [...rule.days],
    section_ids: [...rule.section_ids],
  } as PromotionPrice
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

/** Apply only to the base/required-variant price. Supplements keep their own charges. */
export function promotionPricedItem(
  item: MenuManifestItem,
  sectionId: string,
  promotions: PublicKitchenPromotion[] | undefined,
  day: string
): { item: MenuManifestItem; promotion?: string } {
  const pricing = promotions?.find(
    (offer) =>
      offer.status === 'active' &&
      offer.days.some((value) => value === day) &&
      (!offer.section_ids.length || offer.section_ids.includes(sectionId))
  )
  if (!pricing) return { item }
  const price = pricing.amount_minor / 100
  return {
    item: {
      ...item,
      promotionLabel: pricing.name,
      price,
      priceLabel: String(price),
      priceOptions: item.priceOptions.map((option) => ({
        ...option,
        price,
        priceLabel: String(price),
      })),
    },
    promotion: pricing.name,
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
  return sections.map((section) => ({
    ...section,
    items: section.items.map(
      (item) => promotionPricedItem(item, section.id, promotions, day).item
    ),
  }))
}

export function normalizeKitchenPromotion(
  value: unknown
): KitchenPromotionInput {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid promotion.')
  const data = value as Record<string, unknown>
  if (
    Object.keys(data).some(
      (key) =>
        ![
          'kind',
          'name',
          'status',
          'menu_id',
          'section_ids',
          'currency',
          'amount_minor',
          'days',
        ].includes(key)
    ) ||
    data.kind !== 'fixed_price' ||
    !['active', 'paused'].includes(String(data.status)) ||
    typeof data.menu_id !== 'string' ||
    !data.menu_id ||
    data.menu_id.includes('/')
  )
    throw new Error(
      'Choose a Menu, a fixed price and an active or paused status.'
    )
  const price = normalizePromotionPrice({
    label: data.name,
    currency: data.currency,
    amount_minor: data.amount_minor,
    days: data.days,
    section_ids: data.section_ids,
  })!
  return {
    kind: 'fixed_price',
    name: price.label,
    status: data.status as 'active' | 'paused',
    menu_id: data.menu_id,
    currency: price.currency,
    amount_minor: price.amount_minor,
    days: price.days,
    section_ids: price.section_ids,
  }
}
export function promotionsOverlap(
  a: KitchenPromotionInput,
  b: KitchenPromotionInput
) {
  return (
    a.status === 'active' &&
    b.status === 'active' &&
    a.menu_id === b.menu_id &&
    a.days.some((day) => b.days.includes(day)) &&
    (!a.section_ids.length ||
      !b.section_ids.length ||
      a.section_ids.some((id) => b.section_ids.includes(id)))
  )
}
