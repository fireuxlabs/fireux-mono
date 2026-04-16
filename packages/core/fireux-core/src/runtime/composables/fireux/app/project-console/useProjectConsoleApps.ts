// packages/core/fireux-core/src/runtime/composables/fireux/app/project-console/useProjectConsoleApps.ts

import { computed } from 'vue'
import { useProjectConsole } from './useProjectConsole'
import { useRuntimeProjectData } from './useRuntimeProjectData'
import { useAppInterface } from '../../firestore/core/app/utils/view/useAppInterface'

export function useProjectConsoleApps() {
  const { projectState } = useProjectConsole()

  const runtimeData = useRuntimeProjectData({
    id: projectState.id,
    entity: projectState.entity,
    isDemo: projectState.isDemo,
    scenario: projectState.scenario,
  })

  const { pill, cell } = useAppInterface()

  const apps = computed(() => runtimeData.value.apps ?? [])
  const pending = computed(() => runtimeData.value.pendingApps)

  const appPills = computed(() =>
    apps.value
      .map((app) => pill(app))
      .filter(Boolean)
  )

  const appCells = computed(() =>
    apps.value
      .map((app) => cell(app))
      .filter(Boolean)
  )

  return {
    apps,
    appPills,
    appCells,
    pending,
  }
}