import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useFirestore } from 'vuefire'
import type { FirebaseProduct, Price } from '../../../../../models/objects/product.model'
import { useCreatePricesState } from './Prices/useCreatePricesState'
import { useCreateProductState } from './state/useCreateProductState'

export const ProductPayload = {
  id: '',
  name: '',
  Q: '',
  A: '',
  description: '',
  content: '',
  slug: '',
  active: false,
  main_image: '',
  images: [] as Array<Record<string, any>>,
  features: [] as Array<Record<string, any>>,
  prices: [] as Array<Record<string, any>>,
  default_price: {
    id: '',
    unit_amount: 0,
    interval: '',
  },
  product_type: '',
  track_stock: false,
  stock: 0 as number | null,
  appId: '',
  metadata: {} as Record<string, any>,
}

export const ProductStampOptions = {
  creator: true,
} as const

export function useProductCreate() {
  const db = useFirestore()
  const { setDocument, getCollectionPath } = useFirestoreManager()
  const { getProductPayload } = useCreateProductState()
  const { pricesPayload } = useCreatePricesState()

  async function createProduct(): Promise<{
    success: boolean
    id?: string
    error?: string
  }> {
    try {
      const fireux = useFireUXConfig()
      const payload = getProductPayload()
      const slug = payload.slug || payload.id

      if (!slug) {
        throw new Error('Product slug is required')
      }

      const collectionPath = getCollectionPath('products')
      const ref = doc(db, collectionPath, slug)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        return { success: false, id: slug, error: 'Product already exists' }
      }

      const priceInputs = pricesPayload.value
      if (!priceInputs.length) {
        throw new Error('At least one price is required')
      }

      // 1) Create the Stripe product + prices (source of truth for IDs)
      const stripeResponse = await fetch('/api/stripe/create-product', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product: {
            name: payload.name,
            description: payload.description,
            slug,
            appId: payload.appId || fireux.appId,
            // Stripe expects lowercase currency codes.
            prices: priceInputs.map((price) => ({
              ...price,
              currency: String(price.currency || 'usd').toLowerCase(),
            })),
          },
        }),
      })

      if (!stripeResponse.ok) {
        let detail = stripeResponse.statusText || 'Stripe request failed'
        try {
          const text = await stripeResponse.text()
          if (text) detail = text
        } catch {
          // ignore
        }
        throw new Error(detail)
      }

      const stripeResult = (await stripeResponse.json()) as {
        success?: boolean
        id?: string
        stripe_prices?: string[]
      }

      const stripeProductId = String(stripeResult?.id || '').trim()
      const stripePriceIds = Array.isArray(stripeResult?.stripe_prices)
        ? stripeResult.stripe_prices.map((id) => String(id || '').trim())
        : []

      if (!stripeProductId) {
        throw new Error('Stripe product creation failed (missing id)')
      }

      const normalizedPrices: Price[] = priceInputs.map((price, index) => ({
        id: stripePriceIds[index] || '',
        currency: String(price.currency || 'usd').toLowerCase(),
        unit_amount: Number(price.unit_amount ?? 0),
        type: price.type,
        interval: price.interval,
        interval_count: price.interval_count,
        billing_scheme: price.billing_scheme,
        metadata: price.metadata ?? {},
      }))

      const recurringMonthlyIndex = normalizedPrices.findIndex(
        (price) => price.type === 'recurring' && price.interval === 'month'
      )
      const defaultIndex = recurringMonthlyIndex >= 0 ? recurringMonthlyIndex : 0
      const defaultPriceCandidate = normalizedPrices[defaultIndex]

      const data = {
        ...payload,
        id: slug,
        appId: payload.appId || fireux.appId,
        prices: normalizedPrices,
        default_price: defaultPriceCandidate
          ? {
              id: defaultPriceCandidate.id || '',
              unit_amount: defaultPriceCandidate.unit_amount || 0,
              interval: defaultPriceCandidate.interval,
            }
          : payload.default_price,
        metadata: {
          ...(payload.metadata ?? {}),
          stripe: {
            product_id: stripeProductId,
            price_ids: stripePriceIds,
          },
        },
      } as Omit<FirebaseProduct, 'created_at' | 'updated_at' | 'creator_id'>

      await setDocument<FirebaseProduct>(collectionPath, slug, data as FirebaseProduct, {
        creator: true,
      })

      // 2) Mirror prices in a Firestore subcollection for read-time hydration
      const pricesCollectionPath = `${collectionPath}/${slug}/prices`
      await Promise.all(
        normalizedPrices
          .filter((price) => Boolean(price.id))
          .map((price) =>
            setDocument<Price>(pricesCollectionPath, String(price.id), price, {
              stamp: false,
            })
          )
      )

      return { success: true, id: slug }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (import.meta.dev) {
        console.error('[fireux-products] createProduct failed', error)
      }
      return { success: false, error: message }
    }
  }

  return { createProduct }
}
