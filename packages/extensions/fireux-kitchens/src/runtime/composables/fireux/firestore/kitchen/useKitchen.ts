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
import { useKitchenProfileView } from './utils/view/useKitchenProfileView'

export type { Kitchen }

export {
  useKitchenCollection,
  useKitchenFetch,
  useKitchenCreate,
  useKitchenDelete,
  useKitchenUpdate,
  useKitchenPublish,
  useKitchenSeo,
  useKitchenInterface,
  useKitchenProfileView,
}

export function useKitchen(id: string | Ref<string>) {
  const fetched = useKitchenFetch(id)
  const profileView = useKitchenProfileView(fetched.kitchen)

  return {
    ...fetched,
    ...useKitchenCollection(),
    ...useKitchenCreate(),
    ...useKitchenDelete(),
    ...useKitchenUpdate(),
    ...useKitchenPublish(),
    ...useKitchenInterface(),
    ...profileView,
    useKitchenSeo,
  }
}
