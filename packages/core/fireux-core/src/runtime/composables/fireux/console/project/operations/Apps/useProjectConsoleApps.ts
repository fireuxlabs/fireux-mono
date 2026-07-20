// Concurrent edit — 2026-07-20 16:19 CEST — Console Spine project cleanup: expose filtered App operation outcomes.
import { computed } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import type { App } from 'fireux-core/runtime/models/core/app.model'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { useProjectConsole } from '../../core/useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleApps() {
  const {
    selection,
    runtime,
  } = useProjectConsole()
  const appCollectionPath = computed(() =>
    runtime.source.value === 'live' ? AppStorage.collection : ''
  )
  const {
    apps: appCollection,
    pending,
    error,
  } = useAppCollection(appCollectionPath)
  const apps = computed<App[]>(() => {
    const currentProjectId = selection.projectId.value
    const seen = new Set<string>()

    return (appCollection.value ?? [])
      .filter((entry) => {
        const id = normalizeString(entry.id)
        if (!id || seen.has(id)) return false

        const entryProjectId = normalizeString(entry.project_id)
        if (!currentProjectId || entryProjectId !== currentProjectId) return false

        seen.add(id)
        return true
      }) as App[]
  })
  const count = computed(() => apps.value.length)
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(appCollectionPath.value)),
    count,
    error,
    pending,
  })
  const debug = computed(() => ({
    projectId: selection.projectId.value,
    rootCollection: runtime.rootCollection.value,
    appsCount: count.value,
    pending: pending.value,
    outcome: outcome.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
  }))

  return {
    selectedProject: selection.project,
    projectId: selection.projectId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    apps,
    count,
    pending,
    error,
    outcome,
    debug,
  }
}
