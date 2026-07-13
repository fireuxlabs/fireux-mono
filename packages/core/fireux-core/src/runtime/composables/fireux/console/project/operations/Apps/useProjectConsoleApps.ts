import { computed } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import type { App } from 'fireux-core/runtime/models/core/app.model'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { useProjectConsole } from '../../core/useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleApps() {
  const {
    selection,
    runtime,
  } = useProjectConsole()
  const ecosystemId = computed(() => {
    if (runtime.source.value !== 'live') return ''
    const project = selection.project.value
    return normalizeString(
      project && 'ecosystem_id' in project ? project.ecosystem_id : ''
    )
  })

  const appId = computed(() => {
    if (runtime.source.value !== 'live') return ''
    const project = selection.project.value
    if (!project) return ''
    return normalizeString('app_id' in project ? project.app_id : '')
  })

  const { app, pending } = useAppFetch(appId)
  const appCollectionPath = computed(() =>
    runtime.source.value === 'live' ? AppStorage.collection : ''
  )
  const { apps: appCollection } = useAppCollection(appCollectionPath)
  const apps = computed<App[]>(() => {
    const currentEcosystemId = ecosystemId.value
    const currentProjectId = selection.projectId.value
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
    projectId: selection.projectId.value,
    rootCollection: runtime.rootCollection.value,
    appId: appId.value,
    ecosystemId: ecosystemId.value,
    appsCount: apps.value.length,
    pending: pending.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
  }))

  return {
    selectedProject: selection.project,
    projectId: selection.projectId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    appId,
    ecosystemId,
    app,
    apps,
    pending,
    debug,
  }
}
