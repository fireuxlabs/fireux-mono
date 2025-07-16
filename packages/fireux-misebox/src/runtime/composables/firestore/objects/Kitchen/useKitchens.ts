import { useObject } from 'fireux-core/src/runtime/composables/firestore/objects/useObject'
import { useKitchenCreate } from './useKitchenCreate'
import { useKitchenUpdate } from './useKitchenUpdate'
import { useKitchenDelete } from './useKitchenDelete'

export async function useKitchens() {
  return await useObject({
    collectionName: 'kitchens',
    objectType: 'Kitchen',
    createComposable: useKitchenCreate,
    updateComposable: useKitchenUpdate,
    deleteComposable: useKitchenDelete,
  })
}
