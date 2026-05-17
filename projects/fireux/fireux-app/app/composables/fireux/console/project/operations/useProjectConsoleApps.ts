import { computed } from 'vue'
import { getDemoProject } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import type { App } from 'fireux-core/runtime/models/core/app.model'
import { useProjectConsole } from '../useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleApps() {
  const {
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
  } = useProjectConsole()
  const demoScenario = computed(() =>
    selectedMode.value === 'demo' ? getDemoProject(projectId.value) : null
  )
  const ecosystemId = computed(() => {
    const project = selectedProject.value
    const projectEcosystemId = normalizeString(
      project && 'ecosystem_id' in project ? project.ecosystem_id : ''
    )
    if (projectEcosystemId) return projectEcosystemId
    return normalizeString(demoScenario.value?.project.ecosystem_id)
  })

  const appId = computed(() => {
    const project = selectedProject.value
    if (!project) return ''
    const projectAppId = normalizeString('app_id' in project ? project.app_id : '')
    if (projectAppId) return projectAppId
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
  const apps = computed<App[]>(() => {
    if (selectedMode.value === 'demo') {
      return demoScenario.value?.apps ?? []
    }

    return app.value ? [app.value] : []
  })
  const pending = computed(() => selectedMode.value === 'live' && livePending.value)
  const debug = computed(() => ({
    mode: selectedMode.value,
    projectId: projectId.value,
    rootCollection: rootCollection.value,
    appId: appId.value,
    ecosystemId: ecosystemId.value,
    appsCount: apps.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    appId,
    ecosystemId,
    app,
    apps,
    pending,
    debug,
  }
}
