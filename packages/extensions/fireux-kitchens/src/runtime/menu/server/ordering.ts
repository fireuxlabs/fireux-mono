import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenMenusTarget, serverKitchenMenuSectionsTarget, serverKitchenMenuItemsTarget, KITCHEN_MUTATION_TARGETS } from '../../kitchen/server/mutation-targets'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { readKitchenOfferingsInTransaction } from '../../kitchen/server/offerings/read'
import { resolveKitchenOperationHours } from '../../kitchen/utils/kitchen-readers'
import { resolveServiceHours } from '../../kitchen/utils/service-hours'
import { promotionDay } from '../../kitchen/utils/promotions/pricing'
import {
  kitchenMenuOrdering,
  publicMenuOrderTypes,
  publicMenuServiceOpen,
} from '../utils/menu-ordering'
import { constrainMenuOfferings } from '../utils/menu-hours'
import { serviceBasketLine } from '../utils/service-basket'
import { orderItemReader } from './ordering/items'
import { readMenuOrderSelections } from './ordering/selections'
import type { OrderLine, Order } from '../../kitchen/models/order.model'
import type {
  MenuOrderSelection,
  MenuOrderPricing,
} from '../models/menu-order-selection.model'
export { readMenuOrderSelections }

const fail = (message: string): never => {
  throw createError({ statusCode: 409, statusMessage: message })
}

/** One transaction resolves every Menu source; customer-supplied amounts never set prices. */
export async function resolveMenuOrderLines(
  tx: GuardedServerTransaction,
  input: {
    kitchenId: string
    menuId: string
    selections: MenuOrderSelection[]
    fulfilment: Order['fulfilment']
    expectedTotal: number
  },
  now = new Date()
) {
  const place = await tx.read(
    PLACE_MUTATION_TARGETS.places,
    input.kitchenId
  )
  const kitchen = await tx.read(
    KITCHEN_MUTATION_TARGETS.kitchens,
    input.kitchenId
  )
  const currency = readPlaceCurrencyCode(place.data || {})
  if (!currency) return fail('Menu currency is unavailable.')
  const hours = resolveKitchenOperationHours(
    kitchen.data || {},
    place.data || {}
  )
  const offerings = resolveServiceHours(
    await readKitchenOfferingsInTransaction(tx, input.kitchenId),
    hours
  )
  const readItem = orderItemReader(
    tx,
    input.kitchenId,
    currency,
    hours.timezone
  )
  const menus = new Map<string, Record<string, unknown>>()
  const lines: OrderLine[] = []
  const pricing: MenuOrderPricing = { currency, total: 0, lines: [] }
  for (const [index, selection] of input.selections.entries()) {
    const menuId = selection.menuId || input.menuId
    if (!menus.has(menuId)) {
      const menu = await tx.read(
        serverKitchenMenusTarget(input.kitchenId),
        menuId
      )
      if (
        !menu.exists ||
        menu.data?.status !== 'published' ||
        (menu.data.doc as { url?: string } | undefined)?.url ||
        menu.data.schedule === 'daily' ||
        ['private_link', 'protected_group'].includes(String(menu.data.audience))
      )
        return fail('This menu is no longer available for ordering.')
      menus.set(menuId, menu.data)
    }
    const scoped = constrainMenuOfferings(
      offerings,
      menus.get(menuId)!.serving_hours
    )
      .filter(
        (row) =>
          !selection.offeringIds || selection.offeringIds.includes(row.id)
      )
      .filter((row) => row.collection_timing !== 'next_day')
    const ordering = kitchenMenuOrdering(scoped, menuId)
    const orderType =
      input.fulfilment === 'on_site' ? 'dine_in' : input.fulfilment
    if (
      !publicMenuOrderTypes(ordering).some(
        (config) => config.type === orderType
      )
    )
      return fail('This menu does not currently offer this service.')
    if (!publicMenuServiceOpen(ordering, String(orderType), now))
      return fail(
        'This service is closed. Please order during its serving hours.'
      )
    const section = await tx.read(
      serverKitchenMenuSectionsTarget(input.kitchenId, menuId),
      selection.sectionId
    )
    const entry = await tx.read(
      serverKitchenMenuItemsTarget(
        input.kitchenId,
        menuId,
        selection.sectionId
      ),
      selection.itemId
    )
    if (
      !section.exists ||
      section.data?.status === 'archived' ||
      !entry.exists ||
      entry.data?.status === 'archived'
    )
      return fail('A selected menu item is no longer available.')
    try {
      const item = await readItem(
        entry.data!,
        selection.itemId,
        promotionDay(hours.timezone, now)
      )
      if (!['collection', 'delivery'].includes(String(input.fulfilment)))
        delete item.bottleDeposit
      const resolved = serviceBasketLine(
        {
          source: {
            kitchenId: input.kitchenId,
            menuId,
            sectionId: selection.sectionId,
          },
          item,
          presentation: { currencyCode: currency } as Parameters<
            typeof serviceBasketLine
          >[0]['presentation'],
          offerings: [],
          label: '',
        },
        {
          quantity: selection.quantity,
          optionId: selection.optionId || '',
          extraIds: selection.extraIds || [],
          groups: selection.groups || {},
          ...(selection.bottle ? { bottle: selection.bottle } : {}),
        }
      )
      if (
        selection.expectedUnitMinor !== undefined &&
        selection.expectedUnitMinor !== resolved.unitMinor
      )
        return fail(
          'Menu prices changed. Refresh the menu and review your order.'
        )
      const option = item.priceOptions.find(
        (row) => row.id === selection.optionId
      )
      const notes = item.mealDeal
        ? item.mealDeal.groups.flatMap((group) =>
            (selection.groups?.[group.id] || []).map((id) => {
              const choice = group.dishes.find((row) => row.dishId === id)!
              return `${group.name}: ${choice.name}${choice.supplement ? ` (+${currency} ${choice.supplement.toFixed(2)})` : ''}`
            })
          )
        : item.addOns
            .filter((extra) => selection.extraIds?.includes(extra.id))
            .map(
              (extra) =>
                `${extra.label}${extra.price ? ` (+${currency} ${extra.price.toFixed(2)})` : ''}`
            )
      if (selection.bottle)
        notes.push(
          selection.bottle === 'exchange'
            ? 'Bottle exchange · no deposit'
            : `Bottle deposit · ${currency} ${(resolved.depositUnitMinor / 100).toFixed(2)} per bottle`
        )
      const id = `line-${index + 1}`
      lines.push({
        id,
        item: {
          id: selection.itemId,
          name: item.name + (option ? ` — ${option.label}` : ''),
        },
        ...(notes.length ? { notes } : {}),
        quantity: selection.quantity,
        unit_code: 'C62',
      })
      const total = resolved.unitMinor * selection.quantity
      if (!Number.isSafeInteger(total)) return fail('Order total is invalid.')
      pricing.lines.push({
        line_id: id,
        unit_price: resolved.unitMinor / 100,
        total: total / 100,
      })
      pricing.total += total
    } catch (error) {
      return fail(
        error instanceof Error ? error.message : 'Review your item choices.'
      )
    }
  }
  if (!Number.isSafeInteger(pricing.total))
    return fail('Order total is invalid.')
  pricing.total /= 100
  if (Math.round(pricing.total * 100) !== Math.round(input.expectedTotal * 100))
    return fail('Menu prices changed. Refresh the menu and review your order.')
  return { lines, pricing }
}
