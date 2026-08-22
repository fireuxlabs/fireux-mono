import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { assertPublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type {
  FirebaseProduct,
  ProductCreateInput as CanonicalProductCreateInput,
  ProductPrice,
  StripePriceInput,
} from '../../../models/product.model.ts'
import {
  ProductPriceStorage,
  ProductStorage,
} from '../../../models/product.model.ts'

type StripeProvisionResult = {
  productId: string
  priceIds: string[]
}

export type ProductCreateInput = {
  payload: Partial<CanonicalProductCreateInput>
  priceInputs: StripePriceInput[]
}

export type ProductCreateResult = {
  success: boolean
  id?: string
  error?: string
}

export const ProductPayload = {
  id: '',
  source_app_id: '',
  visibility: 'app',
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
  product_type: '',
}

export const ProductStampOptions = {
  creator: true,
} as const

export const ProductCreatePlan = defineFireuxCreatePlan({
  family: 'with_provision',
})

export function useProductCreate() {
  const db = useFirestore()
  const create = useFirestoreClientCreate()
  const fireux = useFireUXConfig()
  const { currentUser } = useAuth()

  const collectionPath = ProductStorage.collection

  const isProductSlugAvailable = async (slug: string) => {
    const checkRef = doc(db, collectionPath, slug)
    const checkSnap = await getDoc(checkRef)
    return !checkSnap.exists()
  }

  const normalizePrices = (
    inputs: StripePriceInput[],
    priceIds: string[],
    productId: string
  ): ProductPrice[] => {
    const defaultIndexCandidate = inputs.findIndex(
      (price) => price.type === 'recurring' && price.interval === 'month'
    )
    const defaultIndex = defaultIndexCandidate >= 0 ? defaultIndexCandidate : 0

    return inputs.map((price, index) => ({
      id: priceIds[index] || '',
      product_id: productId,
      label: normalizeString(price.metadata?.label),
      currency: String(price.currency || 'usd').toLowerCase(),
      unit_amount: Number(price.unit_amount ?? 0),
      ...(price.type ? { type: price.type } : {}),
      ...(price.interval ? { interval: price.interval } : {}),
      ...(typeof price.interval_count === 'number'
        ? { interval_count: price.interval_count }
        : {}),
      ...(price.billing_scheme ? { billing_scheme: price.billing_scheme } : {}),
      active: true,
      default: index === defaultIndex,
      provider: 'stripe',
      provider_price_id: priceIds[index] || '',
      metadata: price.metadata ?? {},
    }))
  }

  const provisionStripeProduct = async (input: {
    payload: Pick<FirebaseProduct, 'name' | 'description'>
    slug: string
    sourceAppId: string
    priceInputs: StripePriceInput[]
  }): Promise<StripeProvisionResult> => {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    }
    const idToken = await currentUser.value?.getIdToken()
    if (idToken) {
      headers.authorization = `Bearer ${idToken}`
    }

    const stripeResponse = await fetch('/api/stripe/create-product', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product: {
          name: input.payload.name,
          description: input.payload.description,
          slug: input.slug,
          source_app_id: input.sourceAppId,
          prices: input.priceInputs,
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

    const productId = normalizeString(stripeResult?.id)
    const priceIds = Array.isArray(stripeResult?.stripe_prices)
      ? stripeResult.stripe_prices.map((id) => normalizeString(id))
      : []

    if (!productId) {
      throw new Error('Stripe product creation failed (missing id)')
    }
    if (!priceIds.length) {
      throw new Error('Stripe product creation failed (missing prices)')
    }

    return { productId, priceIds }
  }

  const createProductPriceRecords = async (
    productId: string,
    prices: ProductPrice[]
  ) => {
    const pricesCollectionPath =
      `${collectionPath}/${productId}/${ProductPriceStorage.collection}`
    await Promise.all(
      prices
        .filter((price) => Boolean(price.id))
        .map((price) =>
          create(
            defineRuntimeClientCreateTarget(
              'project.product-prices',
              pricesCollectionPath
            ),
            price,
            {
              id: String(price.id),
              stamp: false,
            }
          )
        )
    )
  }

  const createProductFromInput = async (
    input: ProductCreateInput
  ): Promise<ProductCreateResult> => {
    try {
      const payload = input.payload
      const requestedSlug = payload.slug
      if (!requestedSlug) {
        throw new Error('Product slug is required')
      }

      const slug = await assertPublicSlug(requestedSlug, {
        label: 'Product slug',
        namespace: ProductStorage.collection,
        reservedScope: 'entity',
        isAvailable: isProductSlugAvailable,
      })
      const normalizedPriceInputs = input.priceInputs.map((price) => ({
        ...price,
        currency: String(price.currency || 'usd').toLowerCase(),
      }))
      if (!normalizedPriceInputs.length) {
        throw new Error('At least one price is required')
      }

      const sourceAppId = normalizeString(payload.source_app_id || fireux.appId)
      if (!sourceAppId) throw new Error('Product source App is required')

      const stripeProvision = await provisionStripeProduct({
        payload,
        slug,
        sourceAppId,
        priceInputs: normalizedPriceInputs,
      })

      const normalizedPrices = normalizePrices(
        normalizedPriceInputs,
        stripeProvision.priceIds,
        slug
      )
      const data = {
        source_app_id: sourceAppId,
        visibility: payload.visibility || 'app',
        name: normalizeString(payload.name),
        tagline: normalizeString(payload.tagline),
        Q: normalizeString(payload.Q),
        A: normalizeString(payload.A),
        description: normalizeString(payload.description),
        content: normalizeString(payload.content),
        slug,
        active: payload.active !== false,
        main_image: normalizeString(payload.main_image),
        images: Array.isArray(payload.images) ? payload.images : [],
        features: Array.isArray(payload.features) ? payload.features : [],
        categories: Array.isArray(payload.categories) ? payload.categories : [],
        brands: Array.isArray(payload.brands) ? payload.brands : [],
        source_url: normalizeString(payload.source_url),
        requires_template: payload.requires_template === true,
        fulfillment_requirements: Array.isArray(payload.fulfillment_requirements) ? payload.fulfillment_requirements : [],
        product_type: normalizeString(payload.product_type),
      } as CanonicalProductCreateInput

      await create(
        defineRuntimeClientCreateTarget('project.products', collectionPath),
        data as FirebaseProduct,
        { id: slug, creator: true }
      )

      await createProductPriceRecords(slug, normalizedPrices)

      return { success: true, id: slug }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (import.meta.dev) {
        console.error('[fireux-products] createProductFromInput failed', error)
      }
      return { success: false, error: message }
    }
  }

  async function createProduct(
    input: ProductCreateInput
  ): Promise<ProductCreateResult> {
    return createProductFromInput(input)
  }

  return { createPlan: ProductCreatePlan, createProduct, createProductFromInput }
}
