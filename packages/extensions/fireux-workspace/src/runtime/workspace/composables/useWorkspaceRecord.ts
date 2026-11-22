import { computed, type ComputedRef, type Ref } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'

export type WorkspaceRecordAccess = {
  ids: Ref<readonly string[]>
  outcome: Ref<ReadOutcome>
}

/** Gate one selected-record reader and hide any retained result for a previous ID. */
export function useWorkspaceRecord<
  Source extends { outcome: Ref<ReadOutcome> },
  Entity extends { id?: string },
>(
  id: Ref<string>,
  access: WorkspaceRecordAccess,
  read: (id: ComputedRef<string>) => Source,
  recordOf: (source: Source) => Ref<Entity | null | undefined>
) {
  const readId = computed(() =>
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
      ? id.value
      : ''
  )
  const source = read(readId)
  const record = recordOf(source)
  const outcome = computed<ReadOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'empty'
    if (source.outcome.value === 'ready' && record.value?.id !== readId.value)
      return 'pending'
    return source.outcome.value
  })
  const data = computed(() =>
    outcome.value === 'ready' ? (record.value ?? null) : null
  )
  return { data, outcome, readId, source }
}
