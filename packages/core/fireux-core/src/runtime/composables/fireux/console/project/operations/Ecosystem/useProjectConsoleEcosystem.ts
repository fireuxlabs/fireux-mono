import { computed } from 'vue'
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection'
import { useProjectConsole } from '../../core/useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleEcosystem() {
  const {
    selection,
    runtime,
  } = useProjectConsole()

  const ecosystemCollectionPath = computed(() =>
    runtime.source.value === 'live' ? 'ecosystems' : ''
  )
  const { ecosystems: ecosystemCollection, pending } = useEcosystemCollection(
    ecosystemCollectionPath
  )
  const ecosystems = computed(() => {
    const projectId = normalizeString(selection.projectId.value)
    if (!projectId) return []

    return (ecosystemCollection.value ?? []).filter(
      (entry) => normalizeString(entry.project_id) === projectId
    )
  })
  const debug = computed(() => ({
    projectId: selection.projectId.value,
    rootCollection: runtime.rootCollection.value,
    ecosystemsCount: ecosystems.value.length,
    pending: pending.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
  }))

  return {
    selectedProject: selection.project,
    projectId: selection.projectId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    ecosystems,
    pending,
    debug,
  }
}
