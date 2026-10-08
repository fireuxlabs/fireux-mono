import type {
  KitchenOrderChannel,
  KitchenOrderType,
} from '../../../utils/order.ts'
import { deanosKitchenDemoIdentity } from '../../core/fixtures'
import { deanosKitchenDemoTeam } from '../../team'
import { deanosKitchenDemoMenu } from '../Menus/deanos-main'

export const DEANOS_KITCHEN_DEMO_AS_OF_DATE = '2026-07-26'
export const DEANOS_KITCHEN_DEMO_CURRENCY_CODE = 'CHF'
export const DEANOS_KITCHEN_DEMO_TIMEZONE = 'Europe/Zurich'

export type KitchenDemoCompletedOrderItem = {
  menuId: string
  sourceItemId: string
  dishId: string
  itemKind: 'food' | 'drink'
  label: string
  unitPriceMinor: number
  quantity: number
  lineTotalMinor: number
  variantId?: string
  variantLabel?: string
}

export type KitchenDemoCompletedOrder = {
  id: string
  kitchenId: string
  menuId: string
  serviceId: string
  serviceNumber: number
  orderNumber: string
  status: 'completed'
  placedAt: string
  completedAt: string
  orderType: Extract<KitchenOrderType, 'eat_in' | 'takeaway' | 'collection'>
  channel: Extract<KitchenOrderChannel, 'kiosk' | 'menu'>
  closedByTeamMemberId: string
  currencyCode: typeof DEANOS_KITCHEN_DEMO_CURRENCY_CODE
  pricing: {
    minorUnitDigits: 2
    subtotalMinor: number
    deliveryFeeMinor: 0
    totalMinor: number
  }
  items: KitchenDemoCompletedOrderItem[]
}

export type KitchenDemoService = {
  id: string
  kitchenId: string
  date: string
  status: 'active' | 'completed'
  completedOrders: KitchenDemoCompletedOrder[]
}

type CompletedOrderItemMix = {
  sourceItemId: string
  dishId: string
  label: string
  itemKind: 'food' | 'drink'
  unitPriceMinor: number
  variantId?: string
  variantLabel?: string
}

const menuItemById = new Map(
  deanosKitchenDemoMenu.menuSections.flatMap(({ items }) =>
    items.map((item) => [item.id, item] as const)
  )
)
const dishById = new Map(
  deanosKitchenDemoMenu.dishes.map((dish) => [dish.id, dish] as const)
)

function catalogItem(
  sourceItemId: string,
  variantLabel?: string
): CompletedOrderItemMix {
  const menuItem = menuItemById.get(sourceItemId)
  const dish = menuItem ? dishById.get(menuItem.dish_id) : undefined
  const priceOption = variantLabel
    ? menuItem?.price_options.find((option) => option.label === variantLabel)
    : undefined
  const unitPriceMinor = Math.round(
    Number(priceOption?.price ?? menuItem?.price ?? 0) * 100
  )
  if (
    !menuItem ||
    !dish ||
    Boolean(variantLabel && !priceOption) ||
    (dish.item_kind !== 'food' && dish.item_kind !== 'drink') ||
    !Number.isSafeInteger(unitPriceMinor) ||
    unitPriceMinor <= 0
  ) {
    throw new Error(
      `Deanos completed Order item ${sourceItemId} has no valid Menu source.`
    )
  }
  return {
    sourceItemId,
    dishId: dish.id,
    label: dish.name,
    itemKind: dish.item_kind,
    unitPriceMinor,
    ...(priceOption
      ? {
          variantId: priceOption.label.toLowerCase().replaceAll(' ', '-'),
          variantLabel: priceOption.label,
        }
      : {}),
  }
}

const deanosCompletedOrderItems = {
  classic: catalogItem('deanos-classic-item', 'Single'),
  double: catalogItem('double-trouble-item'),
  chicken: catalogItem('hot-honey-chicken-item'),
  swiss: catalogItem('swiss-melt-item'),
  fries: catalogItem('skin-on-fries-item'),
  dirtyFries: catalogItem('dirty-deanos-fries-item'),
  onionRings: catalogItem('onion-rings-item'),
  shake: catalogItem('cherry-vanilla-shake-item'),
  lemonade: catalogItem('house-lemonade-item'),
} as const

const deanosMainRotation = [
  deanosCompletedOrderItems.classic,
  deanosCompletedOrderItems.classic,
  deanosCompletedOrderItems.double,
  deanosCompletedOrderItems.chicken,
  deanosCompletedOrderItems.classic,
  deanosCompletedOrderItems.swiss,
  deanosCompletedOrderItems.double,
  deanosCompletedOrderItems.classic,
] as const

const deanosServiceId = (date: string) => `deanos-service-${date}`

export const deanosKitchenDemoOrderNumber = (
  date: string,
  serviceNumber: number
) => `D${date.replaceAll('-', '')}-${String(serviceNumber).padStart(3, '0')}`

const zurichOffsetForDemoDate = (date: string) =>
  date < '2026-03-29' ? '+01:00' : '+02:00'

const localIso = (date: string, minuteOfDay: number) => {
  const hour = String(Math.floor(minuteOfDay / 60)).padStart(2, '0')
  const minute = String(minuteOfDay % 60).padStart(2, '0')
  return `${date}T${hour}:${minute}:00.000${zurichOffsetForDemoDate(date)}`
}

function buildCompletedOrders(input: {
  date: string
  dayIndex: number
  saleCount: number
}): KitchenDemoCompletedOrder[] {
  const line = (
    item: CompletedOrderItemMix,
    quantity = 1
  ): KitchenDemoCompletedOrderItem => ({
    menuId: deanosKitchenDemoIdentity.menuId,
    sourceItemId: item.sourceItemId,
    dishId: item.dishId,
    itemKind: item.itemKind,
    label: item.label,
    unitPriceMinor: item.unitPriceMinor,
    quantity,
    lineTotalMinor: item.unitPriceMinor * quantity,
    ...(item.variantId ? { variantId: item.variantId } : {}),
    ...(item.variantLabel ? { variantLabel: item.variantLabel } : {}),
  })

  return Array.from({ length: input.saleCount }, (_, index) => {
    const rotationIndex =
      (index * 5 + input.dayIndex * 3) % deanosMainRotation.length
    const items = [line(deanosMainRotation[rotationIndex]!)]
    const sequence = index + input.dayIndex

    if (sequence % 2 === 0) {
      items.push(line(deanosCompletedOrderItems.fries))
    }
    if (sequence % 8 === 0) {
      items.push(line(deanosCompletedOrderItems.dirtyFries))
    }
    if (sequence % 4 === 1) {
      items.push(
        line(deanosCompletedOrderItems.onionRings, sequence % 17 === 0 ? 2 : 1)
      )
    }
    if (sequence % 6 === 2) {
      items.push(line(deanosCompletedOrderItems.shake))
    }
    if (sequence % 5 === 3) {
      items.push(line(deanosCompletedOrderItems.lemonade))
    }

    const completedMinute =
      11 * 60 +
      45 +
      Math.floor((index * 525) / Math.max(input.saleCount - 1, 1))
    const placedMinute = completedMinute - 12
    const serviceNumber = index + 1
    const orderType = (['eat_in', 'takeaway', 'collection'] as const)[
      (input.dayIndex + index) % 3
    ]!
    const teamMember =
      deanosKitchenDemoTeam[
        (input.dayIndex + index) % deanosKitchenDemoTeam.length
      ]!
    const orderNumber = deanosKitchenDemoOrderNumber(input.date, serviceNumber)
    const subtotalMinor = items.reduce(
      (total, item) => total + item.lineTotalMinor,
      0
    )

    return {
      id: `deanos-completed-${orderNumber.toLowerCase()}`,
      kitchenId: deanosKitchenDemoIdentity.kitchenId,
      menuId: deanosKitchenDemoIdentity.menuId,
      serviceId: deanosServiceId(input.date),
      serviceNumber,
      orderNumber,
      status: 'completed',
      placedAt: localIso(input.date, placedMinute),
      completedAt: localIso(input.date, completedMinute),
      orderType,
      channel: orderType === 'collection' ? 'menu' : 'kiosk',
      closedByTeamMemberId: teamMember.id,
      currencyCode: DEANOS_KITCHEN_DEMO_CURRENCY_CODE,
      pricing: {
        minorUnitDigits: 2,
        subtotalMinor,
        deliveryFeeMinor: 0,
        totalMinor: subtotalMinor,
      },
      items,
    }
  })
}

function buildDeanosServices(): KitchenDemoService[] {
  const asOf = Date.parse(`${DEANOS_KITCHEN_DEMO_AS_OF_DATE}T00:00:00.000Z`)
  const baseSaleCountByWeekday = [15, 9, 10, 11, 13, 17, 20]

  return Array.from({ length: 180 }, (_, index) => {
    const date = new Date(asOf - (179 - index) * 86_400_000)
      .toISOString()
      .slice(0, 10)
    const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay()
    const saleCount =
      baseSaleCountByWeekday[weekday]! +
      Math.floor(index / 45) -
      2 +
      ((index * 7) % 9) -
      4 +
      (index % 29 === 0 ? 9 : 0)
    return {
      id: deanosServiceId(date),
      kitchenId: deanosKitchenDemoIdentity.kitchenId,
      date,
      status: date === DEANOS_KITCHEN_DEMO_AS_OF_DATE ? 'active' : 'completed',
      completedOrders: buildCompletedOrders({
        date,
        dayIndex: index,
        saleCount,
      }),
    }
  })
}

export const deanosKitchenDemoServices = buildDeanosServices()

export const deanosKitchenDemoCompletedOrders =
  deanosKitchenDemoServices.flatMap((service) => service.completedOrders)

export const deanosKitchenDemoCurrentService = deanosKitchenDemoServices.at(-1)!
