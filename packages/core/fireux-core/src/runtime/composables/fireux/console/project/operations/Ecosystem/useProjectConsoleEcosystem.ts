import { computed } from 'vue'
import { useEcosystemFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemFetch'
import { useProjectConsole } from '../../core/useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleEcosystem() {
  const {
    selection,
    runtime,
  } = useProjectConsole()

  const ecosystemId = computed(() => {
    const project = selection.project.value
    if (!project) return ''
    return normalizeString('ecosystem_id' in project ? project.ecosystem_id : '')
  })

  const { ecosystem, pending } = useEcosystemFetch(ecosystemId)
  const debug = computed(() => ({
    projectId: selection.projectId.value,
    rootCollection: runtime.rootCollection.value,
    ecosystemId: ecosystemId.value,
    hasEcosystem: Boolean(ecosystem.value),
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
    ecosystemId,
    ecosystem,
    pending,
    debug,
  }
}
