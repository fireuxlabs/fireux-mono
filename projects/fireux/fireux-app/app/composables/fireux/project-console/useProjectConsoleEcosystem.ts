import { computed } from 'vue'
import { getDemoProject } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useEcosystemFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemFetch'
import type { EcosystemSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import { useProjectConsole } from './useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleEcosystem() {
  const { selectedProject, selectedMode } = useProjectConsole()
  const selectedProjectId = computed(() => normalizeString(selectedProject.value?.id))
  const demoScenario = computed(() =>
    selectedMode.value === 'demo' ? getDemoProject(selectedProjectId.value) : null
  )

  const ecosystemId = computed(() => {
    const project = selectedProject.value
    if (!project) return ''
    const projectEcosystemId = normalizeString(
      'ecosystem_id' in project ? project.ecosystem_id : ''
    )
    if (projectEcosystemId) return projectEcosystemId
    if (selectedMode.value === 'demo') {
      return normalizeString(demoScenario.value?.project.ecosystem_id)
    }
    if (selectedMode.value !== 'live') return ''
    return normalizeString('ecosystem_id' in project ? project.ecosystem_id : '')
  })

  const liveEcosystemId = computed(() =>
    selectedMode.value === 'live' ? ecosystemId.value : ''
  )
  const { ecosystem: liveEcosystem, pending: livePending } = useEcosystemFetch(liveEcosystemId)
  const ecosystem = computed<EcosystemSurface | null | undefined>(() => {
    if (selectedMode.value === 'demo') {
      const id = ecosystemId.value
      if (!id) return undefined
      return demoScenario.value?.ecosystems.find((entry) => normalizeString(entry.id) === id) ?? null
    }

    return liveEcosystem.value
  })
  const pending = computed(() => selectedMode.value === 'live' && livePending.value)

  return {
    selectedProject,
    selectedMode,
    ecosystemId,
    ecosystem,
    pending,
  }
}
