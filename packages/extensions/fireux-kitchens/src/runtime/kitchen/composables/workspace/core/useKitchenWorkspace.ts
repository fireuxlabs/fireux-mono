import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenCreate } from '../../firestore/mutations/useKitchenCreate'
import { useKitchenDelete } from '../../firestore/mutations/useKitchenDelete'
import { useKitchenUpdate } from '../../firestore/mutations/useKitchenUpdate'
import { useKitchenRead } from '../../firestore/fetch/useKitchenRead'

export function useKitchenWorkspace() {
  const { selectedId: id } = useWorkspace('kitchen')
  const creation = useKitchenCreate()
  const update = useKitchenUpdate()
  const removal = useKitchenDelete()
  const { kitchen: data, outcome } = useKitchenRead(id)

  return {
    data,
    id,
    outcome,
    crud: {
      create: creation.createKitchen,
      update: (changes: Parameters<typeof update.updateKitchen>[0]['changes']) => update.updateKitchen({ kitchenId: id.value, changes }),
      delete: () => removal.deleteKitchen(id.value),
    },
  }
}
