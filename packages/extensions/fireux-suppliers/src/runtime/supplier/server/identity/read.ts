import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { Business } from 'fireux-businesses/runtime/business/models/business.model'
import { readBusinessDetail } from 'fireux-businesses/runtime/business/server/business/projection'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { SupplierStorage, type Supplier } from '../../models/Supplier.model.ts'
import { normalizeSupplier } from '../../utils/normalize-supplier'

const text = (value: unknown) => String(value ?? '').trim()
export async function readSuppliers(): Promise<{
  suppliers: Supplier[]
  businesses: Business[]
  places: Place[]
}> {
  const snapshot = await getRuntimeFirestore()
    .collection(SupplierStorage.collection)
    .limit(100)
    .get()
  const suppliers = snapshot.docs
    .map((document) => {
      const supplier = normalizeSupplier(document.id, document.data())
      if (!supplier)
        throw createError({
          statusCode: 500,
          statusMessage: 'Supplier directory source is invalid.',
        })
      return supplier
    })
    .filter(
      (supplier) =>
        supplier.identity.status === 'active' && supplier.identity.visibility
    )
  const related = await Promise.all(
    suppliers.map(async (supplier) => {
      const related = await readBusinessDetail(supplier.business_id)
      if (!related.place) throw createError({ statusCode: 409, statusMessage: 'Supplier Business requires a linked location.' })
      return { ...related, place: related.place }
    })
  )
  return {
    suppliers,
    businesses: related.map((item) => item.business),
    places: related.map((item) => item.place),
  }
}

export async function readSupplier(
  idValue: unknown
): Promise<{ supplier: Supplier; business: Business; place: Place }> {
  const id = requireFirestoreDocumentId(idValue, 'Supplier id')
  const db = getRuntimeFirestore()
  const root = await db.collection(SupplierStorage.collection).doc(id).get()
  const supplier = root.exists ? normalizeSupplier(root.id, root.data()) : null
  const businessId = text(supplier?.business_id)
  if (root.exists && !supplier)
    throw createError({
      statusCode: 500,
      statusMessage: 'Supplier source is invalid.',
    })
  if (!supplier || !businessId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Supplier not found.',
    })
  }
  const related = await readBusinessDetail(businessId)
  if (!related.place) throw createError({ statusCode: 409, statusMessage: 'Supplier Business requires a linked location.' })
  return { supplier, business: related.business, place: related.place }
}
