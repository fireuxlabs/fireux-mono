import { computed } from 'vue'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { BlankStorage, type Blank } from '../../../../../models/blank.model'
import { useBlankCreate } from '../../../firestore/blank/useBlank'
import { useBlankWorkspaceIndex } from '../index/useBlankWorkspaceIndex'

export function useBlankWorkspace() {
  const index = useBlankWorkspaceIndex()
  const creation = useBlankCreate()
  const { updateDocument } = useFirestoreUpdate()
  const { deleteDocument } = useFirestoreDelete()
  const data = computed(() => index.collection.value.find((item) => normalizeString(item.id) === index.selectedId.value) ?? null)
  const outcome = computed(() => {
    if (!index.selectedId.value) return 'idle' as const
    if (index.outcome.value === 'pending' || index.outcome.value === 'error') return index.outcome.value
    return data.value ? 'ready' as const : 'missing' as const
  })
  return { data, id: index.selectedId, outcome, crud: {
    create: creation.createBlank,
    update: (changes: Partial<Omit<Blank, 'id'>>) => updateDocument<Blank>(BlankStorage.rootCollection, index.selectedId.value, changes),
    delete: () => deleteDocument(BlankStorage.rootCollection, index.selectedId.value),
  } }
}
