// packages/core/fireux-core/src/runtime/composables/fireux/app/project-console/useProjectConsoleApps.ts

import { computed } from 'vue'
import { useProjectConsole } from './useProjectConsole'
import { useRuntimeProjectData } from './useRuntimeProjectData'

export function useProjectConsoleApps() {
  const { projectState } = useProjectConsole()

  const runtimeData = useRuntimeProjectData({
    id: projectState.id,
    entity: projectState.entity,
    isDemo: projectState.isDemo,
    scenario: projectState.scenario,
  })

  const apps = computed(() => runtimeData.value.apps ?? [])
  const pending = computed(() => runtimeData.value.pendingApps)

  return {
    apps,
    pending,
  }
}
