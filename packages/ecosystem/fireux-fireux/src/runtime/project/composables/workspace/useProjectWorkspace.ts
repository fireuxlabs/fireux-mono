import { computed, watch } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useProjectCollection } from '../useProjectCollection'
import { useProjectAccess } from '../useProjectAccess'
import { useProjectRead } from '../useProjectRead'

export const useProjectWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('project')
  const targets = useProjectCollection()
  const collectionOutcome = computed<WorkspaceTargetOutcome>(() =>
    targets.outcome.value === 'empty' && targets.projectIds.value.length
      ? 'empty'
      : targets.outcome.value
  )

  watch(
    [targets.projects, collectionOutcome, selection.selectedId],
    () =>
      selection.reconcile(
        targets.projects.value.map((project) => project.id),
        collectionOutcome.value
      ),
    { immediate: true }
  )

  // Opening a Workspace is local selection, not an account-primary mutation.

  const id = selection.selectedId
  const access = useProjectAccess()
  const readId = computed(() =>
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
      ? id.value
      : ''
  )
  const source = useProjectRead(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'empty'
    if (
      source.outcome.value === 'ready' &&
      source.data.value?.id !== readId.value
    )
      return 'pending'
    return source.outcome.value
  })
  const data = computed(() =>
    outcome.value === 'ready' && source.data.value?.id === readId.value
      ? source.data.value
      : null
  )

  return {
    data,
    id,
    outcome,
    collection: targets.projects,
    access: targets.access,
    collectionOutcome,
    select: selection.select,
  }
})
