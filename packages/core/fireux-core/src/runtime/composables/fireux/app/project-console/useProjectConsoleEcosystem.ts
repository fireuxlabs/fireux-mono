import { computed } from 'vue'
import { useProjectConsole } from './useProjectConsole'
import { useRuntimeProjectData } from './useRuntimeProjectData'
import { useEcosystemInterface } from '../../firestore/system/ecosystem/utils/view/useEcosystemInterface'

export function useProjectConsoleEcosystem() {
  const { projectState } = useProjectConsole()

  const runtimeData = useRuntimeProjectData({
    id: projectState.id,
    entity: projectState.entity,
    isDemo: projectState.isDemo,
    scenario: projectState.scenario,
  })

  const { pill } = useEcosystemInterface()

  const ecosystem = computed(() => runtimeData.value.ecosystem ?? null)
  const pending = computed(() => runtimeData.value.ecosystemPending)

  const ecosystemPill = computed(() => pill(ecosystem.value))

  return {
    ecosystem,
    ecosystemPill,
    pending,
  }
}