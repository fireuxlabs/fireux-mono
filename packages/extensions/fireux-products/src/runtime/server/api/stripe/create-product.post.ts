// ~/server/api/stripe/create-product.post.ts
import {
  defineEventHandler,
  readBody,
  createError,
  type H3Event,
  type H3Error,
} from 'h3'
import { createRequire } from 'node:module'
import { STRIPE_API_VERSION } from '../../stripe/version'

export default defineEventHandler(async (event: H3Event) => {
  try {
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
      console.warn('⚠️ [create-product] Stripe SDK not installed, using REST fallback')
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

    const stripe = Stripe
      ? new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
      : null

    const stripePost = async (
      path: string,
      form: Record<string, string | number | undefined>,
      idempotencyKey?: string
    ) => {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(form)) {
        if (value === undefined || value === null) continue
        params.set(key, String(value))
      }
      const headers: Record<string, string> = {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': STRIPE_API_VERSION,
      }
      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey
      }
      const response = await fetch(`https://api.stripe.com/v1/${path}`, {
        method: 'POST',
        headers,
        body: params,
      })
      const json = (await response.json()) as Record<string, any>
      if (!response.ok) {
        const stripeMessage =
          typeof json?.error?.message === 'string'
            ? json.error.message
            : `Stripe ${path} failed`
        throw createError({
          statusCode: 500,
          statusMessage: stripeMessage,
        })
      }
      return json
    }

    const stripeGet = async (
      path: string,
      query?: Record<string, string | number | undefined>
    ) => {
      const url = new URL(`https://api.stripe.com/v1/${path}`)
      if (query) {
        for (const [key, value] of Object.entries(query)) {
          if (value === undefined || value === null) continue
          url.searchParams.set(key, String(value))
        }
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Stripe-Version': STRIPE_API_VERSION,
        },
      })
      const json = (await response.json()) as Record<string, any>
      if (!response.ok) {
        const stripeMessage =
          typeof json?.error?.message === 'string'
            ? json.error.message
            : `Stripe ${path} fetch failed`
        throw createError({
          statusCode: 500,
          statusMessage: stripeMessage,
        })
      }
      return json
    }

    const appId = String(product.appId || 'app').trim()
    const slug = String(product.slug || product.name || 'product').trim()
    const baseIdempotency = `${appId}:${slug}`

    const loadAllProducts = async () => {
      const allProducts: any[] = []
      let startingAfter: string | undefined
      for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
        let pageData: any[] = []
        let hasMore = false
        if (stripe) {
          const page = await stripe.products.list({
            active: true,
            limit: 100,
            ...(startingAfter ? { starting_after: startingAfter } : {}),
          })
          pageData = page.data || []
          hasMore = Boolean(page.has_more)
        } else {
          const page = await stripeGet('products', {
            active: 'true',
            limit: 100,
            ...(startingAfter ? { starting_after: startingAfter } : {}),
          })
          pageData = Array.isArray(page.data) ? page.data : []
          hasMore = Boolean(page.has_more)
        }
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
          String(entry?.metadata?.appId || '') === appId &&
          String(entry?.metadata?.slug || '') === slug
      ) || null

    if (stripeProduct) {
      console.log('♻️ [create-product] Reusing Stripe product:', stripeProduct.id)
    } else {
      if (stripe) {
        stripeProduct = await stripe.products.create(
          {
            name: product.name,
            description: product.description || '',
            metadata: {
              appId: product.appId || '',
              slug: product.slug || '',
            },
          },
          {
            idempotencyKey: `products:${baseIdempotency}`,
          }
        )
      } else {
        stripeProduct = await stripePost(
          'products',
          {
            name: product.name,
            description: product.description || '',
            'metadata[appId]': product.appId || '',
            'metadata[slug]': product.slug || '',
          },
          `products:${baseIdempotency}`
        )
      }
      console.log('✅ [create-product] Stripe product created:', stripeProduct.id)
    }

    // Create prices if provided
    const stripePrices: Array<{ id: string }> = []
    const existingPricesForProduct = [] as any[]
    if (stripe) {
      const list = await stripe.prices.list({
        product: stripeProduct.id,
        active: true,
        limit: 100,
      })
      existingPricesForProduct.push(...(list.data || []))
    } else {
      const list = await stripeGet('prices', {
        product: stripeProduct.id,
        active: 'true',
        limit: 100,
      })
      existingPricesForProduct.push(...(Array.isArray(list.data) ? list.data : []))
    }

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
          'prices',
          baseIdempotency,
          index,
          String(price.unit_amount ?? ''),
          String(price.type ?? ''),
          String(price.interval ?? ''),
          String(price.interval_count ?? ''),
        ].join(':')
        let stripePrice: any
        if (stripe) {
          stripePrice = await stripe.prices.create({
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
          }, {
            idempotencyKey: priceKey,
          })
        } else {
          const metadataEntries = Object.entries(price.metadata || {})
          const metadataForm = Object.fromEntries(
            metadataEntries.map(([key, value]) => [`metadata[${key}]`, value as string])
          )
          stripePrice = await stripePost('prices', {
            product: stripeProduct.id,
            unit_amount: price.unit_amount,
            currency: priceCurrency,
            billing_scheme: price.billing_scheme || 'per_unit',
            ...(price.type === 'recurring'
              ? {
                  'recurring[interval]': price.interval,
                  'recurring[interval_count]': price.interval_count || 1,
                }
              : {}),
            ...metadataForm,
          }, priceKey)
        }
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
