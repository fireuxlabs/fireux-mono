import { computed } from 'vue'
import { useEcosystemFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemFetch'
import type { EcosystemSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import { useProjectConsole } from '../../core/useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleEcosystem() {
  const {
    selectedProject,
    projectId,
    rootCollection,
    canWrite,
  } = useProjectConsole()

  const ecosystemId = computed(() => {
    const project = selectedProject.value
    if (!project) return ''
    return normalizeString('ecosystem_id' in project ? project.ecosystem_id : '')
  })

  const { ecosystem, pending } = useEcosystemFetch(ecosystemId)
  const debug = computed(() => ({
    projectId: projectId.value,
    rootCollection: rootCollection.value,
    ecosystemId: ecosystemId.value,
    hasEcosystem: Boolean(ecosystem.value),
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedProject,
    projectId,
    rootCollection,
    canWrite,
    ecosystemId,
    ecosystem,
    pending,
    debug,
  }
}
