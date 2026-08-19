import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readCompanyPlace } from 'fireux-companies/runtime/place/server/company/read'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { SupplierStorage, type Supplier } from '../../models/Supplier.model.ts'

const text = (value: unknown) => String(value ?? '').trim()
export async function readSuppliers(): Promise<Supplier[]> {
  const snapshot = await getRuntimeFirestore()
    .collection(SupplierStorage.collection)
    .limit(100)
    .get()
  return snapshot.docs
    .map(
      (document) =>
        ({
          ...(document.data() as Omit<Supplier, 'id'>),
          id: document.id,
        }) satisfies Supplier
    )
    .sort((a, b) =>
      a.supplier_organization_name.localeCompare(b.supplier_organization_name)
    )
}

export async function readSupplier(
  idValue: unknown
): Promise<{ supplier: Supplier; place: Place }> {
  const id = requireFirestoreDocumentId(idValue, 'Supplier id')
  const db = getRuntimeFirestore()
  const root = await db.collection(SupplierStorage.collection).doc(id).get()
  const supplier = root.exists
    ? ({
        ...(root.data() as Omit<Supplier, 'id'>),
        id: root.id,
      } satisfies Supplier)
    : null
  const companyId = text(root.data()?.company_id)
  if (!supplier || !companyId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Supplier not found.',
    })
  }
  return { supplier, place: await readCompanyPlace(companyId) }
}
