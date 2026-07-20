// Concurrent edit — 2026-07-20 22:32 CEST — Both-Entity Authority — Property: publish fixed reads/writes without unsafe independent lifecycle deletes.
import type { Ref } from 'vue'
import type { Property } from '../../../../models/property.model'
import { usePropertyCollection } from './fetch/usePropertyCollection'
import {
  useAppPropertyFetch,
  usePropertyFetch,
  usePropertyManualFetch,
} from './fetch/usePropertyFetch'
import { usePropertyCreate } from './mutations/usePropertyCreate'
import { usePropertyUpdate } from './mutations/usePropertyUpdate'
import { usePropertyInterface } from './utils/view/usePropertyInterface'

export type { Property }
export type {
  PropertyCollectionFilter,
  PropertyCollectionShape,
} from './fetch/usePropertyCollection'

export {
  usePropertyCollection,
  usePropertyFetch,
  useAppPropertyFetch,
  usePropertyManualFetch,
  usePropertyCreate,
  usePropertyUpdate,
  usePropertyInterface,
}

export function useProperty(id: string | Ref<string>) {
  const fetched = usePropertyFetch(id)

  return {
    ...fetched,
    ...usePropertyCollection(),
    ...usePropertyCreate(),
    ...usePropertyUpdate(),
    ...usePropertyInterface(),
  }
}
