import { computed } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import type { App } from 'fireux-core/runtime/models/core/app.model'
import { useProjectConsole } from '../../core/useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleApps() {
  const {
    selectedProject,
    projectId,
    rootCollection,
    canWrite,
  } = useProjectConsole()
  const ecosystemId = computed(() => {
    const project = selectedProject.value
    return normalizeString(
      project && 'ecosystem_id' in project ? project.ecosystem_id : ''
    )
  })

  const appId = computed(() => {
    const project = selectedProject.value
    if (!project) return ''
    return normalizeString('app_id' in project ? project.app_id : '')
  })

  const { app, pending } = useAppFetch(appId)
  const { apps: appCollection } = useAppCollection()
  const apps = computed<App[]>(() => {
    const currentEcosystemId = ecosystemId.value
    const currentProjectId = projectId.value
    const primaryAppId = appId.value
    const seen = new Set<string>()

    return (appCollection.value ?? [])
      .filter((entry) => {
        const id = normalizeString(entry.id)
        if (!id || seen.has(id)) return false

        const entryEcosystemId = normalizeString(
          entry.ecosystem_id || entry.ecosystem
        )
        const entryProjectId = normalizeString(entry.project_id)
        const inScope =
          id === primaryAppId ||
          (currentEcosystemId && entryEcosystemId === currentEcosystemId) ||
          (currentProjectId && entryProjectId === currentProjectId)

        if (!inScope) return false

        seen.add(id)
        return true
      }) as App[]
  })
  const debug = computed(() => ({
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
