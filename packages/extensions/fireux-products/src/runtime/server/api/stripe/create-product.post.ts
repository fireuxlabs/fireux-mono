// ~/server/api/stripe/create-product.post.ts
import {
  defineEventHandler,
  readBody,
  createError,
  type H3Event,
  type H3Error,
} from 'h3'
import { createRequire } from 'node:module'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { ProductPriceStorage, ProductStorage } from '../../../models/product.model'
import { STRIPE_API_VERSION } from '../../stripe/version'
import { assertProductsServiceAccess } from '../../utils/assertProductsServiceAccess'

export default defineEventHandler(async (event: H3Event) => {
  try {
    await assertProductsServiceAccess(event)

    // Quick guard: if no secret key, return 501 (not configured) instead of crashing
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Stripe not configured (missing STRIPE_SECRET_KEY)',
      })
    }

    // Lazy import Stripe so dev without the package/env won’t crash at load time
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

    const body = await readBody(event)
    const { product, ping } = body

    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product data is required',
      })
    }

    console.log('🔄 [create-product] Creating Stripe product:', product.name)
    if (ping) {
      console.log('🏓 [create-product] Ping received:', ping)
    }

    const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })

    const appId = String(product.source_app_id || product.appId || 'app').trim()
    const slugValidation = validatePublicSlug(product.slug, {
      label: 'Product slug',
      namespace: ProductStorage.collection,
      reservedScope: 'entity',
    })
    if (!slugValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: slugValidation.message || 'Product slug is required',
      })
    }
    const slug = slugValidation.slug
    const baseIdempotency = `${appId}:${slug}`

    const loadAllProducts = async () => {
      const allProducts: any[] = []
      let startingAfter: string | undefined
      for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
        const page = await stripe.products.list({
          active: true,
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        })
        const pageData = page.data || []
        const hasMore = Boolean(page.has_more)
        allProducts.push(...pageData)
        if (!hasMore || !pageData.length) break
        startingAfter = String(pageData[pageData.length - 1]?.id || '')
        if (!startingAfter) break
      }
      return allProducts
    }

    const existingProducts = await loadAllProducts()
    let stripeProduct =
      existingProducts.find(
        (entry) =>
          String(entry?.metadata?.source_app_id || entry?.metadata?.appId || '') === appId &&
          String(entry?.metadata?.slug || '') === slug
      ) || null

    if (stripeProduct) {
      console.log('♻️ [create-product] Reusing Stripe product:', stripeProduct.id)
    } else {
      stripeProduct = await stripe.products.create(
        {
          name: product.name,
          description: product.description || '',
          metadata: {
            appId: product.appId || '',
            source_app_id: product.source_app_id || product.appId || '',
            slug,
          },
        },
        {
          idempotencyKey: `products:${baseIdempotency}`,
        }
      )
      console.log('✅ [create-product] Stripe product created:', stripeProduct.id)
    }

    // Create prices if provided
    const stripePrices: Array<{ id: string }> = []
    const existingPricesForProduct = [] as any[]
    const list = await stripe.prices.list({
      product: stripeProduct.id,
      active: true,
      limit: 100,
    })
    existingPricesForProduct.push(...(list.data || []))

    const findMatchingPrice = (inputPrice: Record<string, any>) =>
      existingPricesForProduct.find((entry) => {
        const sameCurrency =
          String(entry?.currency || '').toLowerCase() ===
          String(inputPrice.currency || '').toLowerCase()
        const sameAmount = Number(entry?.unit_amount || 0) === Number(inputPrice.unit_amount || 0)
        const sameScheme =
          String(entry?.billing_scheme || 'per_unit') ===
          String(inputPrice.billing_scheme || 'per_unit')
        const inputType = String(inputPrice.type || 'one_time')
        if (!sameCurrency || !sameAmount || !sameScheme) return false
        if (inputType === 'recurring') {
          return (
            String(entry?.recurring?.interval || '') === String(inputPrice.interval || '') &&
            Number(entry?.recurring?.interval_count || 1) ===
              Number(inputPrice.interval_count || 1)
          )
        }
        return !entry?.recurring
      })

    if (product.prices && product.prices.length > 0) {
      for (let index = 0; index < product.prices.length; index += 1) {
        const price = product.prices[index]
        const priceCurrency = String(price.currency || 'eur').toLowerCase()
        const existingPrice = findMatchingPrice(price)
        if (existingPrice?.id) {
          stripePrices.push(existingPrice)
          console.log('♻️ [create-product] Reusing Stripe price:', existingPrice.id)
          continue
        }

        const priceKey = [
          ProductPriceStorage.collection,
          baseIdempotency,
          index,
          String(price.unit_amount ?? ''),
          String(price.type ?? ''),
          String(price.interval ?? ''),
          String(price.interval_count ?? ''),
        ].join(':')
        const stripePrice = await stripe.prices.create(
          {
            product: stripeProduct.id,
            unit_amount: price.unit_amount,
            currency: priceCurrency,
            billing_scheme: price.billing_scheme || 'per_unit',
            metadata: price.metadata || {},
            recurring:
              price.type === 'recurring'
                ? {
                    interval: price.interval,
                    interval_count: price.interval_count || 1,
                  }
                : undefined,
          },
          {
            idempotencyKey: priceKey,
          }
        )
        stripePrices.push(stripePrice)
        existingPricesForProduct.push(stripePrice)
        console.log('✅ [create-product] Stripe price created:', stripePrice.id)
      }
    }

    return {
      success: true,
      id: stripeProduct.id,
      stripe_prices: stripePrices.map((p) => p.id),
      message: `Product '${product.name}' created successfully in Stripe`,
      pong: ping === 'ping' ? 'pong' : undefined,
    }
  } catch (error) {
    console.error('❌ [create-product] Error:', error)

    // Preserve explicit h3 status codes (e.g. 501 when Stripe is not configured).
    const maybeH3 = error as Partial<H3Error>
    if (
      typeof maybeH3?.statusCode === 'number' &&
      maybeH3.statusCode >= 400 &&
      maybeH3.statusCode < 600
    ) {
      throw createError({
        statusCode: maybeH3.statusCode,
        statusMessage:
          maybeH3.statusMessage ||
          (error instanceof Error ? error.message : 'Request failed'),
      })
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create product: ${errorMessage}`,
    })
  }
})
