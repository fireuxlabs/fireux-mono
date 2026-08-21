// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: snapshot source item identity for validated amend resubmission.
import { createError } from 'h3'
import type { Firestore } from 'firebase-admin/firestore'
import type { KitchenOrderType } from '../../../kitchen/models/order.model.ts'
import type { DishItemKind } from '../../../kitchen/models/dish.model.ts'
import { readKitchenMenuSections } from '../manifest/sections.ts'
import { isMenuOrderingEnabled, readMenuOrderingConfig } from './config.ts'
import type { MenuOrderContext } from './context.ts'
import {
  resolveMenuOrderAddOns,
  resolveMenuOrderVariant,
  type MenuOrderOption,
  type RequestedMenuOrderItem,
} from './lines.ts'
import { numberValue, text } from './order-request.ts'

export type ResolvedMenuOrderItem = {
  id: string
  source_item_id: string
  menu_id: string
  dish_id: string
  item_kind: DishItemKind
  label: string
  quantity: number
  unit_price: number
  add_ons?: MenuOrderOption[]
  variant_id?: string
  variant_label?: string
  checked: false
}

const safeSegment = (value: string) =>
  Boolean(value && !value.includes('/') && value !== '.' && value !== '..')

export async function resolveMenuOrderItems(
  db: Firestore,
  input: {
    context: MenuOrderContext
    orderType: KitchenOrderType
    requestedItems: RequestedMenuOrderItem[]
  }
) {
  const sourceMenuIds = Array.from(
    new Set(
      input.requestedItems.map(
        (item) => text(item.menuId) || input.context.menuId
      )
    )
  )
  if (!sourceMenuIds.every(safeSegment)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu item source is invalid.',
    })
  }

  const rowsByMenuId = new Map(
    await Promise.all(
      sourceMenuIds.map(async (sourceMenuId) => {
        const sourceMenuSnap = await db
          .doc(`kitchens/${input.context.kitchenId}/menus/${sourceMenuId}`)
          .get()
        const sourceMenuData = sourceMenuSnap.data() || {}
        if (
          !sourceMenuSnap.exists ||
          text(sourceMenuData.status) !== 'published'
        ) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Menu item source is not available.',
          })
        }

        const sourceOrdering = readMenuOrderingConfig(
          sourceMenuData,
          input.context.fulfilment,
          input.context.operationHours
        )
        if (
          !isMenuOrderingEnabled(sourceOrdering) ||
          !sourceOrdering.order_types.some(
            (type) => type.type === input.orderType
          )
        ) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Menu item source does not accept this order type.',
          })
        }

        const sections = await readKitchenMenuSections(db, {
          appId: input.context.appId,
          kitchenId: input.context.kitchenId,
          menuId: sourceMenuId,
        })

        return [
          sourceMenuId,
          new Map(
            sections.flatMap((section) =>
              section.items.map((item) => [item.id, item])
            )
          ),
        ] as const
      })
    )
  )
  const items: ResolvedMenuOrderItem[] = input.requestedItems.map(
    (requestedItem, index) => {
      const sourceMenuId = text(requestedItem.menuId) || input.context.menuId
      const item = rowsByMenuId.get(sourceMenuId)?.get(requestedItem.itemId)
      if (!item?.dish_id) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Menu item not found.',
        })
      }
      const variant = resolveMenuOrderVariant(
        item.priceOptions,
        requestedItem.variant
      )
      const addOns = resolveMenuOrderAddOns(
        item.addOns || [],
        requestedItem.addOns
      )
      const addOnsTotal = addOns.reduce(
        (sum, addOn) => sum + numberValue(addOn.price),
        0
      )
      const basePrice = variant
        ? numberValue(variant.price)
        : numberValue(item.price)
      const label = [item.name, variant?.label].filter(Boolean).join(' · ')

      return {
        id: `item-${index + 1}`,
        source_item_id: requestedItem.itemId,
        menu_id: sourceMenuId,
        dish_id: item.dish_id,
        item_kind: item.item_kind,
        label,
        quantity: requestedItem.quantity,
        unit_price: basePrice + addOnsTotal,
        ...(addOns.length ? { add_ons: addOns } : {}),
        ...(variant
          ? {
              variant_id: text(variant.id),
              variant_label: variant.label,
            }
          : {}),
        checked: false,
      }
    }
  )
  if (!items.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu item is required.',
    })
  }

  return {
    items,
    subtotal: items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    ),
  }
}
