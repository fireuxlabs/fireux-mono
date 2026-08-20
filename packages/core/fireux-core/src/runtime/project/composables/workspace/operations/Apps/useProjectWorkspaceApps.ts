// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: expose filtered App operation outcomes.
import { computed } from 'vue'
import { useAppCollection } from '../../../../../app/composables/firestore/fetch/useAppCollection'
import { useFirestoreCollectionState } from '../../../../../composables/fireux/firestore/operations/useFirestoreCollection'
import type { App } from '../../../../../app/models/app.model.ts'
import { AppStorage } from '../../../../../app/models/app.model.ts'
import { useProjectWorkspace } from '../../core/useProjectWorkspace'
import {
  findProjectWorkspaceDemoScenario,
  useProjectWorkspaceDemoData,
} from '../../core/useProjectWorkspaceDemoData'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectWorkspaceApps() {
  const { selection, runtime } = useProjectWorkspace()
  const appCollectionPath = computed(() =>
    runtime.dataType.value === 'live' ? AppStorage.collection : ''
  )
  const {
    apps: appCollection,
    pending,
    error,
  } = useAppCollection(appCollectionPath)
  const demoData = useProjectWorkspaceDemoData(
    runtime.isDemo
  )
  const apps = computed<App[]>(() => {
    const currentProjectId = selection.projectId.value
    const seen = new Set<string>()

    const source =
      runtime.isDemo.value
        ? (findProjectWorkspaceDemoScenario(demoData.data.value, currentProjectId)
            ?.apps ?? [])
        : (appCollection.value ?? [])
    return source.filter((entry) => {
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
    active: computed(
      () => runtime.isDemo.value || Boolean(appCollectionPath.value)
    ),
    count,
    error,
    pending: computed(() =>
      runtime.isDemo.value ? demoData.pending.value : pending.value
    ),
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
