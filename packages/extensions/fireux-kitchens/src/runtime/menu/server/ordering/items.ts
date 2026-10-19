import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenDishesTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { kitchenPromotionsTarget } from '../../../kitchen/server/promotions/target'
import { readDishPricing } from '../../../kitchen/utils/dish-pricing'
import {
  normalizeKitchenPromotion,
  promotionPricedItem,
} from '../../../kitchen/utils/promotions/pricing'
import type { MenuManifestItem } from '../../models/menu-detail.model'
import type { PublicKitchenPromotion } from '../../../kitchen/models/promotion.model'

/** Canonical commercial terms, acquired inside the existing submission transaction. */
export function orderItemReader(
  tx: GuardedServerTransaction,
  kitchenId: string,
  currency: string,
  timezone: string
) {
  const dishes = new Map<string, Promise<Record<string, unknown>>>()
  function dish(id: string) {
    if (!dishes.has(id))
      dishes.set(
        id,
        tx.read(serverKitchenDishesTarget(kitchenId), id).then((row) => {
          if (
            !row.exists ||
            row.data?.status === 'archived' ||
            typeof row.data?.name !== 'string' ||
            !row.data.name.trim()
          )
            throw new Error('A selected dish is unavailable.')
          return row.data
        })
      )
    return dishes.get(id)!
  }
  let promotions: Promise<PublicKitchenPromotion[]> | undefined
  function offers() {
    return (promotions ||= (async () => {
      const result: PublicKitchenPromotion[] = []
      let after: string | undefined
      for (;;) {
        const page = await tx.readAll<Record<string, unknown>>(
          kitchenPromotionsTarget(kitchenId),
          1000,
          after
        )
        for (const { id, data } of page) {
          if (data.status !== 'active' || 'groups' in data) continue
          const { name, status, currency: code, days, dishes } = data
          const offer = normalizeKitchenPromotion({
            name,
            status,
            currency: code,
            days,
            dishes,
          })
          if ('dishes' in offer && offer.currency === currency)
            result.push({ ...offer, id, timezone })
        }
        if (page.length < 1000) break
        after = page.at(-1)!.id
      }
      return result.sort((a, b) => a.id.localeCompare(b.id))
    })())
  }
  return async (
    entry: Record<string, unknown>,
    id: string,
    day: string
  ): Promise<MenuManifestItem> => {
    const item: MenuManifestItem = {
      id,
      dishId: '',
      itemKind: 'food',
      name: '',
      description: '',
      imageUrl: '',
      price: 0,
      priceLabel: '',
      priceOptions: [],
      addOns: [],
    }
    if (typeof entry.promotion_id === 'string' && !entry.dish_id) {
      const saved = await tx.read(
        kitchenPromotionsTarget(kitchenId),
        entry.promotion_id
      )
      if (
        !saved.exists ||
        saved.data?.status !== 'active' ||
        !Array.isArray(saved.data.groups)
      )
        throw new Error('This meal deal is unavailable.')
      const { name, status, currency: code, days, price, groups } = saved.data
      const deal = normalizeKitchenPromotion({
        name,
        status,
        currency: code,
        days,
        price,
        groups,
      })
      if (
        !('groups' in deal) ||
        deal.currency !== currency ||
        !deal.days.includes(day as never)
      )
        throw new Error('This meal deal is unavailable at this serving time.')
      const resolved = await Promise.all(
        deal.groups.map(async (group) => ({
          ...group,
          dishes: await Promise.all(
            group.dishes.map(async (choice) => ({
              ...choice,
              name: String((await dish(choice.dishId)).name),
            }))
          ),
        }))
      )
      return {
        ...item,
        name: deal.name,
        price: deal.price,
        mealDeal: {
          promotionId: entry.promotion_id,
          days: deal.days,
          timezone,
          groups: resolved,
        },
      }
    }
    if (typeof entry.dish_id !== 'string' || entry.promotion_id)
      throw new Error('A selected item is unavailable.')
    const data = await dish(entry.dish_id)
    const terms = readDishPricing(data)
    const canonical = {
      ...item,
      dishId: entry.dish_id,
      name: String(data.name).trim(),
      price: terms.price,
      ...(terms.bottle_deposit ? { bottleDeposit: terms.bottle_deposit } : {}),
      priceOptions: terms.price_options.map((option, index) => ({
        id:
          option.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
          `option-${index + 1}`,
        label: option.label,
        price: option.price,
        priceLabel: String(option.price),
      })),
      addOns: terms.add_ons.map((extra) => ({
        ...extra,
        priceLabel: String(extra.price),
      })),
    }
    return promotionPricedItem(canonical, await offers(), day).item
  }
}
