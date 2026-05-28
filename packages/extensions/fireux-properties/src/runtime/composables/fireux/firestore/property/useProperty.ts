import type { Ref } from 'vue'
import type { Property } from '../../../../models/property.model'
import { usePropertyCollection } from './fetch/usePropertyCollection'
import { usePropertyFetch } from './fetch/usePropertyFetch'
import { usePropertyCreate } from './mutations/usePropertyCreate'
import { usePropertyDelete } from './mutations/usePropertyDelete'
import { usePropertyUpdate } from './mutations/usePropertyUpdate'
import { usePropertyInterface } from './utils/view/usePropertyInterface'

export type { Property }

export {
  usePropertyCollection,
  usePropertyFetch,
  usePropertyCreate,
  usePropertyDelete,
  usePropertyUpdate,
  usePropertyInterface,
}

type UsePropertyOptions = {
  shape?: 'root' | 'overlay'
  collectionPath?: string
}

export function useProperty(id: string | Ref<string>, options: UsePropertyOptions = {}) {
  const fetched = usePropertyFetch(id, options)

  return {
    ...fetched,
    ...usePropertyCollection(),
    ...usePropertyCreate(options),
    ...usePropertyDelete(options),
    ...usePropertyUpdate(options),
    ...usePropertyInterface(),
  }
}
