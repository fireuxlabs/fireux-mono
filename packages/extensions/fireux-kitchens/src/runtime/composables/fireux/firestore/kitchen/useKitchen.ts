import type { Ref } from 'vue'
import type { Kitchen } from '../../../../models/kitchen.model'
import { useKitchenFetch } from './fetch/useKitchenFetch'
import { useKitchenList } from './fetch/useKitchenList'
import { useKitchenCreate } from './mutations/useKitchenCreate'
import { useKitchenDelete } from './mutations/useKitchenDelete'
import { useKitchenPublish } from './mutations/useKitchenPublish'
import { useKitchenUpdate } from './mutations/useKitchenUpdate'
import { useKitchenSeo } from './utils/useKitchenSeo'
import { useKitchenComputed } from './utils/view/useKitchenComputed'
import { useKitchenInterface } from './utils/view/useKitchenInterface'

export type { Kitchen }
export type {
  KitchenListFilter,
} from './fetch/useKitchenList'

export {
  useKitchenFetch,
  useKitchenList,
  useKitchenCreate,
  useKitchenDelete,
  useKitchenUpdate,
  useKitchenPublish,
  useKitchenSeo,
  useKitchenComputed,
  useKitchenInterface,
}

export function useKitchen(id: string | Ref<string>) {
  const fetched = useKitchenFetch(id)

  return {
    ...fetched,
    ...useKitchenCreate(),
    ...useKitchenDelete(),
    ...useKitchenUpdate(),
    ...useKitchenPublish(),
    ...useKitchenComputed(fetched.kitchen),
    ...useKitchenInterface(),
    useKitchenSeo,
  }
}
