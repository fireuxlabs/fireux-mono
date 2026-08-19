// Concurrent edit — 2026-07-20 22:37 CEST — Supplier/Portfolio Authority Hardening: expose fixed reads and identity writes without unsafe lifecycle deletes.
import type { Ref } from 'vue'
import type { AppSupplier, Supplier } from '../../models/Supplier.model.ts'
import type { SupplierCard } from './utils/view/useSupplierInterface'
import { useSupplierInterface } from './utils/view/useSupplierInterface'
import { useSupplierCreate } from './mutations/useSupplierCreate'
import { useSupplierCollection } from './fetch/useSupplierCollection'
import { useAppSupplierFetch, useSupplierFetch } from './fetch/useSupplierFetch'
import { useSupplierUpdate } from './mutations/useSupplierUpdate'
import { useSupplierSeo } from '../useSupplierSeo'
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
  useAppSupplierFetch,
  useSupplierCreate,
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
 *   - create and canonical identity update helpers
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
    ...useSupplierUpdate(),
    ...useSupplierComputed(fetched.supplier),
    ...useSupplierInterface(),
    useSupplierSeo,
  }
}
