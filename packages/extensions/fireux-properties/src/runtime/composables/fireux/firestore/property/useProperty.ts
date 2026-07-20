// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Property: publish fixed root/app seams without scope options.
import type { Ref } from 'vue'
import type { Property } from '../../../../models/property.model'
import { usePropertyCollection } from './fetch/usePropertyCollection'
import { useAppPropertyFetch, usePropertyFetch } from './fetch/usePropertyFetch'
import { usePropertyCreate } from './mutations/usePropertyCreate'
import { usePropertyDelete } from './mutations/usePropertyDelete'
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
  usePropertyCreate,
  usePropertyDelete,
  usePropertyUpdate,
  usePropertyInterface,
}

export function useProperty(id: string | Ref<string>) {
  const fetched = usePropertyFetch(id)

  return {
    ...fetched,
    ...usePropertyCollection(),
    ...usePropertyCreate(),
    ...usePropertyDelete(),
    ...usePropertyUpdate(),
    ...usePropertyInterface(),
  }
}
