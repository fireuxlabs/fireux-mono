import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { Company } from 'fireux-companies/runtime/place/models/company.model'
import { readCompanyDetail } from 'fireux-companies/runtime/place/server/company/projection'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { SupplierStorage, type Supplier } from '../../models/Supplier.model.ts'
import { normalizeSupplier } from '../../utils/normalize-supplier'

const text = (value: unknown) => String(value ?? '').trim()
export async function readSuppliers(): Promise<{
  suppliers: Supplier[]
  companies: Company[]
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
    suppliers.map((supplier) => readCompanyDetail(supplier.company_id))
  )
  return {
    suppliers,
    companies: related.map((item) => item.company),
    places: related.map((item) => item.place),
  }
}

export async function readSupplier(
  idValue: unknown
): Promise<{ supplier: Supplier; company: Company; place: Place }> {
  const id = requireFirestoreDocumentId(idValue, 'Supplier id')
  const db = getRuntimeFirestore()
  const root = await db.collection(SupplierStorage.collection).doc(id).get()
  const supplier = root.exists ? normalizeSupplier(root.id, root.data()) : null
  const companyId = text(supplier?.company_id)
  if (root.exists && !supplier)
    throw createError({
      statusCode: 500,
      statusMessage: 'Supplier source is invalid.',
    })
  if (!supplier || !companyId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Supplier not found.',
    })
  }
  const related = await readCompanyDetail(companyId)
  return { supplier, company: related.company, place: related.place }
}
