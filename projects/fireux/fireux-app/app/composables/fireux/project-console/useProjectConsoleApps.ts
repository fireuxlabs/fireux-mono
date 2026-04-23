import { computed } from 'vue'
import { getDemoProject } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import type { App } from 'fireux-core/runtime/models/core/app.model'
import { useProjectConsole } from './useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleApps() {
  const { selectedProject, selectedMode } = useProjectConsole()
  const selectedProjectId = computed(() => normalizeString(selectedProject.value?.id))
  const demoScenario = computed(() =>
    selectedMode.value === 'demo' ? getDemoProject(selectedProjectId.value) : null
  )

  const appId = computed(() => {
    const project = selectedProject.value
    if (!project) return ''
    if (selectedMode.value === 'demo') {
      return normalizeString(demoScenario.value?.project.app_id)
    }
    if (selectedMode.value !== 'live') return ''
    return normalizeString('app_id' in project ? project.app_id : '')
  })

  const liveAppId = computed(() => (selectedMode.value === 'live' ? appId.value : ''))
  const { app: liveApp, pending: livePending } = useAppFetch(liveAppId)
  const app = computed<App | null | undefined>(() => {
    if (selectedMode.value === 'demo') {
      const id = appId.value
      if (!id) return undefined
      return demoScenario.value?.apps.find((entry) => normalizeString(entry.id) === id) ?? null
    }

    return liveApp.value
  })
  const pending = computed(() => selectedMode.value === 'live' && livePending.value)

  return {
    selectedProject,
    selectedMode,
    appId,
    app,
    pending,
  }
}
