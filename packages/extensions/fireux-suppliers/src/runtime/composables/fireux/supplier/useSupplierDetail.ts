import type { Ref } from 'vue'
import {
  useSupplierFetch,
  type SupplierFetchKey,
  type SupplierFetchSource,
} from '../firestore/supplier/fetch/useSupplierFetch'

export type UseSupplierDetailOptions = {
  key?: SupplierFetchKey | Ref<SupplierFetchKey>
  source?: SupplierFetchSource | Ref<SupplierFetchSource>
}

export function useSupplierDetail(
  locator: string | Ref<string>,
  options: UseSupplierDetailOptions = {}
) {
  return useSupplierFetch(locator, options)
}
