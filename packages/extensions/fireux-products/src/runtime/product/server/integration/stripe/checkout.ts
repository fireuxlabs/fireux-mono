import { createRequire } from 'node:module'
import { useRuntimeConfig } from '#imports'
import { createError, getRequestURL, type H3Event } from 'h3'
import { ProductPriceStorage, ProductStorage } from '../../../utils/product'
import { STRIPE_API_VERSION } from './version'
import { getProductsFirestore } from '../../core/getAdmin'
import { checkoutBuyerSession } from './buyer-session'
import { publicProduct } from '../../read'

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

async function findCheckoutPriceMatch(
  db: FirebaseFirestore.Firestore,
  productId: string,
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

  return null
}

async function assertCheckoutProductAndPrice(input: {
  appId: string
  productId: string
  slug: string
  priceId: string
  mode: CheckoutMode
  scope: { role: string; appId: string }
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
  const productSnap = await db
    .doc(`${ProductStorage.collection}/${input.productId}`)
    .get()
  if (!productSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const product = productSnap.data() as Record<string, any>
  if (!publicProduct(input.productId, product, input.scope)) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }
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

  const price = await findCheckoutPriceMatch(db, input.productId, input.priceId)
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

export async function createProductCheckout(
  event: H3Event,
  body: CreateCheckoutSessionBody,
  options: {
    returnPath?: string
    metadata?: Record<string, string>
    idempotencyKey?: string
  } = {}
) {
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

  const appId = String(body?.appId || '').trim()
  const productId = String(body?.productId || '').trim()
  const slug = String(body?.slug || '').trim()
  const priceId = String(body?.priceId || '').trim()
  const mode: CheckoutMode =
    body?.mode === 'payment' ? 'payment' : 'subscription'

  if (!appId || !productId || !slug || !priceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required checkout fields',
    })
  }

  const runtime = useRuntimeConfig(event)
  await assertCheckoutProductAndPrice({
    appId,
    productId,
    slug,
    priceId,
    mode,
    scope: {
      role: runtime.public.fireux.role,
      appId: runtime.public.fireux.id,
    },
  })

  const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
  const baseUrl = baseUrlFromEvent(event)
  const buyer = await checkoutBuyerSession(event, secret)

  const session = await stripe.checkout.sessions.create(
    {
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: options.returnPath
        ? `${baseUrl}${options.returnPath}`
        : `${baseUrl}/products/success?session_id={CHECKOUT_SESSION_ID}&product=${encodeURIComponent(slug)}`,
      cancel_url: options.returnPath
        ? `${baseUrl}${options.returnPath}`
        : `${baseUrl}/products/${encodeURIComponent(slug)}`,
      allow_promotion_codes: true,
      metadata: {
        ...options.metadata,
        appId,
        productId,
        slug,
      },
    },
    options.idempotencyKey
      ? { idempotencyKey: options.idempotencyKey }
      : undefined
  )

  await buyer.update({
    checkouts: [...(buyer.data.checkouts ?? []).slice(-9), session.id],
  })

  return {
    success: true,
    id: session.id,
    url: session.url || '',
  }
}
