// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: expose filtered App operation outcomes.
import { computed } from 'vue'
import { useAppCollection } from '../../../../../app/composables/firestore/fetch/useAppCollection'
import { useFirestoreCollectionState } from '../../../../../composables/fireux/firestore/operations/useFirestoreCollection'
import type { App } from '../../../../../app/models/app.model.ts'
import { useProjectWorkspace } from '../../core/useProjectWorkspace'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectWorkspaceApps() {
  const workspace = useProjectWorkspace()
  const appCollectionPath = computed(() => 'apps')
  const {
    apps: appCollection,
    pending,
    error,
  } = useAppCollection(appCollectionPath)
  const apps = computed<App[]>(() => {
    const currentProjectId = workspace.selectedId.value
    const seen = new Set<string>()
    return (appCollection.value ?? []).filter((entry) => {
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
    active: computed(() => Boolean(workspace.selectedId.value)),
    count,
    error,
    pending,
  })

  return {
    selectedProject: workspace.data,
    projectId: workspace.selectedId,
    apps,
    count,
    pending,
    error,
    outcome,
  }
}
