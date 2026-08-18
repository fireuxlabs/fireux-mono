import { createRequire } from 'node:module'
import {
  createError,
  defineEventHandler,
  getRequestURL,
  readBody,
  type H3Event,
} from 'h3'
import { ProductPriceStorage, ProductStorage } from '../../../product/models/product.model.ts'
import { STRIPE_API_VERSION } from '../../../product/server/integration/stripe/version'
import { getProductsFirestore } from '../../../product/server/core/getAdmin'

type CreateCheckoutSessionBody = {
  appId?: string
  productId?: string
  slug?: string
  priceId?: string
  mode?: 'payment' | 'subscription'
}

type CheckoutMode = 'payment' | 'subscription'

type CheckoutPriceMatch = {
  type?: string
  active?: boolean
  provider?: string
}

function normalizeString(value: unknown): string {
  return String(value || '').trim()
}

function baseUrlFromEvent(event: H3Event) {
  const configured = process.env.APP_DOMAIN?.trim()
  const url = getRequestURL(event)
  if (configured) {
    const normalized = configured.replace(/\/$/, '')
    if (/^https?:\/\//i.test(normalized)) return normalized
    return `${url.protocol}//${normalized}`
  }
  return `${url.protocol}//${url.host}`
}

function assertSafeDocumentSegment(value: string, label: string) {
  if (!value || value.includes('/') || value === '.' || value === '..') {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is not valid`,
    })
  }
}

function assertStripePriceId(value: string) {
  if (!value.startsWith('price_')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stripe price id is not valid',
    })
  }
}

function assertModeMatchesPrice(price: CheckoutPriceMatch, mode: CheckoutMode) {
  const priceType = normalizeString(price.type)
  if (!priceType) return

  const expectedMode = priceType === 'recurring' ? 'subscription' : 'payment'
  if (mode !== expectedMode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Checkout mode does not match product price',
    })
  }
}

function priceMatchesRequestedStripePrice(
  price: Record<string, unknown>,
  priceId: string
) {
  const id = normalizeString(price.id)
  const providerPriceId = normalizeString(price.provider_price_id)
  return id === priceId || providerPriceId === priceId
}

async function findCheckoutPriceMatch(
  db: FirebaseFirestore.Firestore,
  productId: string,
  product: Record<string, any>,
  priceId: string
): Promise<CheckoutPriceMatch | null> {
  const pricesPath = `${ProductStorage.collection}/${productId}/${ProductPriceStorage.collection}`
  const priceRef = db.doc(`${pricesPath}/${priceId}`)
  const priceSnap = await priceRef.get()
  if (priceSnap.exists) {
    return priceSnap.data() as CheckoutPriceMatch
  }

  const providerPriceSnap = await db
    .collection(pricesPath)
    .where('provider_price_id', '==', priceId)
    .limit(2)
    .get()

  if (providerPriceSnap.size > 1) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Product price relationship is ambiguous',
    })
  }

  if (!providerPriceSnap.empty) {
    return providerPriceSnap.docs[0]?.data() as CheckoutPriceMatch
  }

  const embeddedPrices = Array.isArray(product.prices) ? product.prices : []
  const embeddedPrice = embeddedPrices.find(
    (price: unknown) =>
      !!price &&
      typeof price === 'object' &&
      priceMatchesRequestedStripePrice(price as Record<string, unknown>, priceId)
  )
  if (embeddedPrice && typeof embeddedPrice === 'object') {
    return embeddedPrice as CheckoutPriceMatch
  }

  const stripePriceIds = Array.isArray(product.metadata?.stripe?.price_ids)
    ? product.metadata.stripe.price_ids
        .map((id: unknown) => normalizeString(id))
        .filter(Boolean)
    : []
  if (stripePriceIds.includes(priceId)) {
    return { provider: 'stripe' }
  }

  const defaultPriceId = normalizeString(product.default_price?.id)
  if (defaultPriceId === priceId) {
    return { provider: 'stripe' }
  }

  return null
}

async function assertCheckoutProductAndPrice(input: {
  appId: string
  productId: string
  slug: string
  priceId: string
  mode: CheckoutMode
}) {
  assertSafeDocumentSegment(input.appId, 'appId')
  assertSafeDocumentSegment(input.productId, 'productId')
  assertSafeDocumentSegment(input.slug, 'slug')
  assertSafeDocumentSegment(input.priceId, 'priceId')
  assertStripePriceId(input.priceId)

  if (input.slug !== input.productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug must match product id',
    })
  }

  const db = getProductsFirestore()
  const productSnap = await db.doc(`${ProductStorage.collection}/${input.productId}`).get()
  if (!productSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const product = productSnap.data() as Record<string, any>
  const sourceAppId = normalizeString(product.source_app_id)
  const productSlug = normalizeString(product.slug)

  if (sourceAppId !== input.appId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product does not belong to requested app',
    })
  }

  if (productSlug !== input.slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug does not match requested checkout slug',
    })
  }

  if (product.active === false) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product is not active for checkout',
    })
  }

  const price = await findCheckoutPriceMatch(
    db,
    input.productId,
    product,
    input.priceId
  )
  if (!price) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Price does not belong to requested product',
    })
  }

  if (price.active === false) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product price is not active for checkout',
    })
  }

  const provider = normalizeString(price.provider)
  if (provider && provider !== 'stripe') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product price is not configured for Stripe checkout',
    })
  }

  assertModeMatchesPrice(price, input.mode)
}

export default defineEventHandler(async (event: H3Event) => {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Stripe not configured (missing STRIPE_SECRET_KEY)',
    })
  }

  const require = createRequire(import.meta.url)
  let Stripe: any = null
  try {
    Stripe = require('stripe')
    if (Stripe?.default) Stripe = Stripe.default
  } catch {
    Stripe = null
  }

  if (!Stripe) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Stripe SDK not installed',
    })
  }

  const body = (await readBody(event)) as CreateCheckoutSessionBody
  const appId = String(body?.appId || '').trim()
  const productId = String(body?.productId || '').trim()
  const slug = String(body?.slug || '').trim()
  const priceId = String(body?.priceId || '').trim()
  const mode: CheckoutMode = body?.mode === 'payment' ? 'payment' : 'subscription'

  if (!appId || !productId || !slug || !priceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required checkout fields',
    })
  }

  await assertCheckoutProductAndPrice({ appId, productId, slug, priceId, mode })

  const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
  const baseUrl = baseUrlFromEvent(event)

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/products/success?session_id={CHECKOUT_SESSION_ID}&product=${encodeURIComponent(slug)}`,
    cancel_url: `${baseUrl}/products/${encodeURIComponent(slug)}`,
    allow_promotion_codes: true,
    metadata: {
      appId,
      productId,
      slug,
    },
  })

  return {
    success: true,
    id: session.id,
    url: session.url || '',
  }
})
