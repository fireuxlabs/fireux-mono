import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  SupplierCatalogueStorage,
  type SupplierCatalogue,
  type SupplierCatalogueCreateInput,
} from '../../../models/Supplier.model.ts'
import { resolveSupplierCatalogueCollectionPath } from '../../useSupplierCatalogueCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierCatalogueCreate(
  options: {
    supplierCollectionPath?: string
  } = {}
) {
  const { createDocument: create } = useFirestoreCreate()

  async function createSupplierCatalogue(
    supplierId: string,
    input: SupplierCatalogueCreateInput
  ): Promise<string> {
    const resolvedSupplierId = normalizeString(supplierId)
    if (!resolvedSupplierId) {
      throw new Error('[fireux-suppliers] supplier id is required.')
    }

    const name = normalizeString(input.name)
    if (!name) {
      throw new Error('[fireux-suppliers] catalogue name is required.')
    }

    const collectionPath = resolveSupplierCatalogueCollectionPath(
      resolvedSupplierId,
      options.supplierCollectionPath
    )
    const payload: Partial<SupplierCatalogue> = {
      ...input,
      supplier_id: resolvedSupplierId,
      name,
    }

    return create(collectionPath, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createSupplierCatalogue,
    collectionName: SupplierCatalogueStorage.collection,
  }
}
