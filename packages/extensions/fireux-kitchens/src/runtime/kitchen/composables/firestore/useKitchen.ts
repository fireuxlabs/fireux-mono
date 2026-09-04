import type { Ref } from 'vue'
import type { Kitchen } from '../../models/kitchen.model.ts'
import { useKitchenCollection } from './fetch/useKitchenCollection'
import { useKitchenRead } from './fetch/useKitchenRead'
import { useKitchenCreate } from './mutations/useKitchenCreate'
import { useKitchenDelete } from './mutations/useKitchenDelete'
import { useKitchenUpdate } from './mutations/useKitchenUpdate'
import { useKitchenSeo } from '../useKitchenSeo'
import { useKitchenComputed } from './utils/view/useKitchenComputed'
import { useKitchenInterface } from './utils/view/useKitchenInterface'

export type { Kitchen }
export {
  useKitchenCollection,
  useKitchenRead,
  useKitchenCreate,
  useKitchenDelete,
  useKitchenUpdate,
  useKitchenSeo,
  useKitchenComputed,
  useKitchenInterface,
}

export function useKitchen(id: string | Ref<string>) {
  const fetched = useKitchenRead(id)

  return {
    ...fetched,
    ...useKitchenCreate(),
    ...useKitchenDelete(),
    ...useKitchenUpdate(),
    ...useKitchenComputed(fetched.kitchen),
    ...useKitchenInterface(),
    useKitchenSeo,
  }
}
