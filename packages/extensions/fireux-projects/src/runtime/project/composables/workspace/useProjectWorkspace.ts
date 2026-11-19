import { useWorkspaceRecord } from 'fireux-core/runtime/workspace/composables/useWorkspaceRecord'
import { watch } from 'vue'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useProjectCollection } from '../useProjectCollection'
import { useProjectRead } from '../useProjectRead'

export const useProjectWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('project')
  const id = selection.selectedId
  const {
    projects: collection,
    outcome: collectionOutcome,
    access,
  } = useProjectCollection()

  watch(
    [collection, collectionOutcome, id],
    () =>
      selection.reconcile(
        collection.value.map((project) => project.id),
        collectionOutcome.value
      ),
    { immediate: true }
  )

  const { data, outcome } = useWorkspaceRecord(
    id,
    access,
    useProjectRead,
    (source) => source.data
  )

  return {
    data,
    id,
    outcome,
    collection,
    access,
    collectionOutcome,
    select: selection.select,
  }
})
