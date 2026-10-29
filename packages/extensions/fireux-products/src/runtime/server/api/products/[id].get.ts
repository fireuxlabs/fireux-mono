import {
  defineEventHandler,
  setResponseHeader,
  createError,
  getRouterParam,
  type H3Event,
} from 'h3'

import { useRuntimeConfig } from '#imports'
import {
  ProductPriceStorage,
  ProductStorage,
} from '../../../product/utils/product.ts'
import { getProductsFirestore } from '../../../product/server/core/getAdmin'
import { joinProductRead } from '../../../product/utils/normalize-product.ts'

import {
  publicProduct,
  publicProductPrice,
  serializeFirestoreValue,
} from '../../../product/server/read'

function assertSafeDocumentSegment(value: string) {
  if (!value || value.includes('/') || value === '.' || value === '..') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is not valid',
    })
  }
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const id = String(getRouterParam(event, 'id') || '').trim()
  assertSafeDocumentSegment(id)

  const db = getProductsFirestore()
  const productRef = db.collection(ProductStorage.collection).doc(id)
  const productSnap = await productRef.get()

  if (!productSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const fireux = useRuntimeConfig(event).public?.fireux
  const product = publicProduct(productSnap.id, productSnap.data(), {
    role: String(fireux?.role || ''),
    appId: String(fireux?.id || ''),
  })
  if (!product)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  const pricesSnap = await productRef
    .collection(ProductPriceStorage.collection)
    .get()
  const prices = pricesSnap.docs
    .map((doc) => publicProductPrice(product.id, doc.id, doc.data()))
    .filter((price): price is NonNullable<typeof price> => Boolean(price))

  return serializeFirestoreValue(joinProductRead(product, prices))
})
