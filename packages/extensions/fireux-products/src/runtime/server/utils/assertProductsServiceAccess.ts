import { useRuntimeConfig } from '#imports'
import { timingSafeEqual } from 'node:crypto'
import { createError, getHeader, type H3Event } from 'h3'

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function safeEquals(value: string, expected: string): boolean {
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function serviceKeyFromRequest(event: H3Event): string {
  const authorization = firstString(getHeader(event, 'authorization'))
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]

  return firstString(
    getHeader(event, 'x-fireux-products-service-key'),
    getHeader(event, 'x-fireux-products-internal-key'),
    getHeader(event, 'x-fireux-internal-key'),
    bearer
  )
}

function configuredServiceKey(event: H3Event): string {
  const runtime = useRuntimeConfig(event) as any
  const fireuxProducts = runtime?.fireuxProducts || {}
  const fireux = runtime?.fireux || {}

  return firstString(
    process.env.FIREUX_PRODUCTS_SERVICE_KEY,
    process.env.FIREUX_PRODUCTS_INTERNAL_API_KEY,
    process.env.FIREUX_INTERNAL_API_KEY,
    fireuxProducts.serviceKey,
    fireuxProducts.internalApiKey,
    fireux.serviceKey,
    fireux.internalApiKey
  )
}

export function assertProductsServiceAccess(event: H3Event) {
  const serviceKey = configuredServiceKey(event)
  if (!serviceKey) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  if (!safeEquals(serviceKeyFromRequest(event), serviceKey)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized FireUX products request.',
    })
  }
}
