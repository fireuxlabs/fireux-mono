import { computed } from 'vue'
import { useEcosystemFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemFetch'
import { useProjectConsole } from './useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleEcosystem() {
  const { selectedProject, selectedMode } = useProjectConsole()

  const ecosystemId = computed(() => {
    const project = selectedProject.value
    if (!project || selectedMode.value !== 'live') return ''
    return normalizeString('ecosystem_id' in project ? project.ecosystem_id : '')
  })

  const { ecosystem, pending } = useEcosystemFetch(ecosystemId)

  return {
    selectedProject,
    selectedMode,
    ecosystemId,
    ecosystem,
    pending,
  }
}
