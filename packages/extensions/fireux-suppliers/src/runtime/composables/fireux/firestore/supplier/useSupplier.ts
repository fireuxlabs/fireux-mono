import type { Ref } from 'vue'
import type { AppSupplier, Supplier } from '../../../../models/supplier/Supplier.model'
import type { SupplierCard } from './utils/view/useSupplierInterface'
import { useSupplierInterface } from './utils/view/useSupplierInterface'
import { useSupplierCreate } from './mutations/useSupplierCreate'
import { useSupplierCollection } from './fetch/useSupplierCollection'
import { useSupplierFetch } from './fetch/useSupplierFetch'
import { useSupplierDelete } from './mutations/useSupplierDelete'
import { useSupplierUpdate } from './mutations/useSupplierUpdate'
import { useSupplierSeo } from './utils/useSupplierSeo'
import { useSupplierComputed } from './utils/view/useSupplierComputed'

export type {
  SupplierCard,
  Supplier as SupplierEntity,
  AppSupplier as SupplierWorkspace,
}
export type {
  SupplierCollectionFilter,
  SupplierCollectionSource,
} from './fetch/useSupplierCollection'
export {
  useSupplierCollection,
  useSupplierFetch,
  useSupplierCreate,
  useSupplierDelete,
  useSupplierUpdate,
  useSupplierSeo,
  useSupplierComputed,
  useSupplierInterface,
}

/**
 * useSupplier
 * - Canonical Supplier entity entry seam.
 * - Exposes:
 *   - fetch one Supplier by id
 *   - Supplier collection
 *   - create/update/delete helpers
 *   - computed helpers
 *   - interface helpers
 *
 * Selected supplier console runtime lives under console/supplier, not here.
 */
export function useSupplier(id: string | Ref<string>) {
  const fetched = useSupplierFetch(id)

  return {
    ...fetched,
    ...useSupplierCollection(),
    ...useSupplierCreate(),
    ...useSupplierDelete(),
    ...useSupplierUpdate(),
    ...useSupplierComputed(fetched.supplier),
    ...useSupplierInterface(),
    useSupplierSeo,
  }
}
