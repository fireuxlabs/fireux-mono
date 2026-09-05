import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { PropertyStorage } from '../../../models/property.model.ts'
import { usePropertyCreate } from '../../firestore/mutations/usePropertyCreate'
import { usePropertyUpdate } from '../../firestore/mutations/usePropertyUpdate'
import { usePropertyFetch } from '../../firestore/fetch/usePropertyFetch'

export function usePropertyWorkspace() {
  const { selectedId: id } = useWorkspace('property')
  const creation = usePropertyCreate()
  const update = usePropertyUpdate()
  const { deleteDocument } = useFirestoreDelete()
  const { property: data, outcome } = usePropertyFetch(id)
  return { data, id, outcome, crud: {
    create: creation.createPropertyWorkspace,
    update: (changes: Parameters<typeof update.updatePropertyRoot>[0]['changes']) => update.updatePropertyRoot({ propertyId: id.value, changes }),
    delete: () => deleteDocument(PropertyStorage.rootCollection, id.value),
  } }
}
