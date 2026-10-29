import { defineEventHandler, setResponseHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getProductsFirestore } from '../../../product/server/core/getAdmin'
import {
  publicProduct,
  serializeFirestoreValue,
} from '../../../product/server/read'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const fireux = useRuntimeConfig(event).public?.fireux
  const scope = {
    role: String(fireux?.role || ''),
    appId: String(fireux?.id || ''),
  }
  let query = getProductsFirestore()
    .collection('products')
    .where('visibility', '==', 'public')
    .where('active', '==', true)
  if (['tenant', 'standalone'].includes(scope.role)) {
    if (!scope.appId) return []
    query = query.where('source_app_id', '==', scope.appId)
  }
  const snapshot = await query.get()
  return serializeFirestoreValue(
    snapshot.docs.flatMap((doc) => {
      const product = publicProduct(doc.id, doc.data(), scope)
      return product ? [product] : []
    })
  )
})
