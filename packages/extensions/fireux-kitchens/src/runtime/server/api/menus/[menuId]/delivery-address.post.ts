// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: use only the Menu Kitchen's explicit Place delivery origin.
import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  checkMenuDeliveryAddress,
  checkMenuDeliveryCoordinates,
  checkMenuDeliveryPlaceId,
  resolveMenuDeliveryOrigin,
} from '../../../../menu/server/ordering/delivery-address.ts'
import { readMenuOrderContext } from '../../../../menu/server/ordering/context.ts'
import {
  isMenuOrderingEnabled,
  readKitchenMenuOrdering,
} from '../../../../menu/server/ordering/config.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as {
    kitchen_offering_id?: unknown
    address?: unknown
    place_id?: unknown
    placeId?: unknown
    lat?: unknown
    lng?: unknown
  } | null
  const kitchenOfferingId =
    typeof body?.kitchen_offering_id === 'string'
      ? body.kitchen_offering_id.trim()
      : ''
  const address = text(body?.address)
  const placeId = text(body?.place_id || body?.placeId)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const ordering = readKitchenMenuOrdering(
    context.kitchenOfferings,
    context.menuId,
    context.fulfilment
  )
  const deliveryPolicy = ordering.order_types.find(
    (type) =>
      type.type === 'delivery' && type.kitchen_offering_id === kitchenOfferingId
  )
  if (
    !isMenuOrderingEnabled(ordering) ||
    !deliveryPolicy ||
    deliveryPolicy.availability?.paused ||
    !deliveryPolicy.offering_hours?.operation_hours.windows.length
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu does not accept delivery orders.',
    })
  }

  const zones = deliveryPolicy.fulfilment?.delivery_zones || []
  const origin = await resolveMenuDeliveryOrigin(context.kitchenPlaceId, zones)
  if (placeId) {
    return checkMenuDeliveryPlaceId(placeId, zones, origin)
  }

  const lat = Number(body?.lat)
  const lng = Number(body?.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return checkMenuDeliveryCoordinates(lat, lng, zones, origin)
  }

  return checkMenuDeliveryAddress(address, zones, origin)
})
