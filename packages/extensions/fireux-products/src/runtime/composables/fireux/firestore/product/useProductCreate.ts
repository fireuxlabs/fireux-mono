import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useFirestore } from 'vuefire'
import type {
  FirebaseProduct,
  Price,
  StripePriceInput,
} from '../../../../../models/product.model'
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
  const fireux = useFireUXConfig()

  const collectionPath = getCollectionPath('products')

  const resolveAvailableSlug = async (baseSlug: string) => {
    let attempt = 0
    let candidate = baseSlug
    while (attempt < 100) {
      const checkRef = doc(db, collectionPath, candidate)
      const checkSnap = await getDoc(checkRef)
      if (!checkSnap.exists()) return candidate
      attempt += 1
      candidate = `${baseSlug}-${attempt + 1}`
    }
    throw new Error('Unable to allocate unique slug')
  }

  const normalizePrices = (
    inputs: StripePriceInput[],
    priceIds: string[]
  ): Price[] =>
    inputs.map((price, index) => ({
      id: priceIds[index] || '',
      currency: String(price.currency || 'usd').toLowerCase(),
      unit_amount: Number(price.unit_amount ?? 0),
      ...(price.type ? { type: price.type } : {}),
      ...(price.interval ? { interval: price.interval } : {}),
      ...(typeof price.interval_count === 'number'
        ? { interval_count: price.interval_count }
        : {}),
      ...(price.billing_scheme ? { billing_scheme: price.billing_scheme } : {}),
      ...(price.metadata ? { metadata: price.metadata } : {}),
    }))

  const chooseDefaultPrice = (normalizedPrices: Price[]) => {
    const recurringMonthlyIndex = normalizedPrices.findIndex(
      (price) => price.type === 'recurring' && price.interval === 'month'
    )
    const defaultIndex = recurringMonthlyIndex >= 0 ? recurringMonthlyIndex : 0
    return normalizedPrices[defaultIndex]
  }

  const createProductFromInput = async (input: {
    payload: Omit<FirebaseProduct, 'created' | 'updated'> &
      Partial<Pick<FirebaseProduct, 'created' | 'updated'>>
    priceInputs: StripePriceInput[]
  }): Promise<{
    success: boolean
    id?: string
    error?: string
  }> => {
    try {
      const payload = input.payload
      const requestedSlug = payload.slug || payload.id
      if (!requestedSlug) {
        throw new Error('Product slug is required')
      }

      const slug = await resolveAvailableSlug(requestedSlug)
      const normalizedPriceInputs = input.priceInputs.map((price) => ({
        ...price,
        currency: String(price.currency || 'usd').toLowerCase(),
      }))
      if (!normalizedPriceInputs.length) {
        throw new Error('At least one price is required')
      }

      const stripeResponse = await fetch('/api/stripe/create-product', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product: {
            name: payload.name,
            description: payload.description,
            slug,
            appId: payload.appId || fireux.appId,
            prices: normalizedPriceInputs,
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
      if (!stripePriceIds.length) {
        throw new Error('Stripe product creation failed (missing prices)')
      }

      const normalizedPrices = normalizePrices(normalizedPriceInputs, stripePriceIds)
      const defaultPriceCandidate = chooseDefaultPrice(normalizedPrices)

      const data = {
        ...payload,
        id: slug,
        slug,
        appId: payload.appId || fireux.appId,
        prices: normalizedPrices,
        default_price: defaultPriceCandidate
          ? {
              id: defaultPriceCandidate.id || '',
              unit_amount: defaultPriceCandidate.unit_amount || 0,
              ...(defaultPriceCandidate.interval
                ? { interval: defaultPriceCandidate.interval }
                : {}),
            }
          : payload.default_price,
        metadata: {
          ...(payload.metadata ?? {}),
          stripe: {
            product_id: stripeProductId,
            price_ids: stripePriceIds,
            configured: true,
          },
        },
      } as Omit<FirebaseProduct, 'created' | 'updated'>

      await setDocument<FirebaseProduct>(collectionPath, slug, data as FirebaseProduct, {
        creator: true,
      })

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
        console.error('[fireux-products] createProductFromInput failed', error)
      }
      return { success: false, error: message }
    }
  }

  async function createProduct(): Promise<{
    success: boolean
    id?: string
    error?: string
  }> {
    const payload = getProductPayload()
    const inputs = pricesPayload.value as StripePriceInput[]
    return createProductFromInput({
      payload: payload as any,
      priceInputs: inputs,
    })
  }

  return { createProduct, createProductFromInput }
}
