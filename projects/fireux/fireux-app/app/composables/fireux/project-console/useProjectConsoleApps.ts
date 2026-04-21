import { computed } from 'vue'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import { useProjectConsole } from './useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleApps() {
  const { selectedProject, selectedMode } = useProjectConsole()

  const appId = computed(() => {
    const project = selectedProject.value
    if (!project || selectedMode.value !== 'live') return ''
    return normalizeString('app_id' in project ? project.app_id : '')
  })

  const { app, pending } = useAppFetch(appId)

  return {
    selectedProject,
    selectedMode,
    appId,
    app,
    pending,
  }
}
