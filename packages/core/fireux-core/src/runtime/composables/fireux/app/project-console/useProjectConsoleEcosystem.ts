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

  const { profile } = useEcosystemInterface()

  const ecosystem = computed(() => runtimeData.value.ecosystem ?? null)
  const pending = computed(() => runtimeData.value.ecosystemPending)

  const ecosystemProfile = computed(() => profile(ecosystem.value))

  return {
    ecosystem,
    ecosystemProfile,
    pending,
  }
}
