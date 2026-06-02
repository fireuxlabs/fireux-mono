import type { Ref } from 'vue'
import type { Kitchen } from '../../../../models/kitchen.model'
import { useKitchenCollection } from './fetch/useKitchenCollection'
import { useKitchenFetch } from './fetch/useKitchenFetch'
import { useKitchenCreate } from './mutations/useKitchenCreate'
import { useKitchenDelete } from './mutations/useKitchenDelete'
import { useKitchenPublish } from './mutations/useKitchenPublish'
import { useKitchenUpdate } from './mutations/useKitchenUpdate'
import { useKitchenSeo } from './utils/useKitchenSeo'
import { useKitchenInterface } from './utils/view/useKitchenInterface'

export type { Kitchen }
export type {
  KitchenCollectionFilter,
  KitchenCollectionSource,
} from './fetch/useKitchenCollection'

export {
  useKitchenCollection,
  useKitchenFetch,
  useKitchenCreate,
  useKitchenDelete,
  useKitchenUpdate,
  useKitchenPublish,
  useKitchenSeo,
  useKitchenInterface,
}

export function useKitchen(id: string | Ref<string>) {
  const fetched = useKitchenFetch(id)

  return {
    ...fetched,
    ...useKitchenCollection(),
    ...useKitchenCreate(),
    ...useKitchenDelete(),
    ...useKitchenUpdate(),
    ...useKitchenPublish(),
    ...useKitchenInterface(),
    useKitchenSeo,
  }
}
