import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import {
  checkMenuDeliveryAddress,
  checkMenuDeliveryCoordinates,
  checkMenuDeliveryPlaceId,
} from '../../../utils/menu-delivery-address.ts'
import { readMenuOrderContext } from '../../../utils/menu-order-context.ts'
import {
  isMenuOrderingEnabled,
  readMenuOrderingConfig,
} from '../../../utils/menu-ordering.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as {
    address?: unknown
    place_id?: unknown
    placeId?: unknown
    lat?: unknown
    lng?: unknown
  } | null
  const address = text(body?.address)
  const placeId = text(body?.place_id || body?.placeId)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const ordering = readMenuOrderingConfig(context.menuData, context.fulfilment)
  const deliveryPolicy = ordering.order_types.find((type) =>
    type.type === 'delivery'
  )
  if (!isMenuOrderingEnabled(ordering) || !deliveryPolicy) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu does not accept delivery orders.',
    })
  }

  const zones = deliveryPolicy.fulfilment?.delivery_zones || []
  if (placeId) {
    return checkMenuDeliveryPlaceId(placeId, zones)
  }

  const lat = Number(body?.lat)
  const lng = Number(body?.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return checkMenuDeliveryCoordinates(lat, lng, zones)
  }

  return checkMenuDeliveryAddress(address, zones)
})
