// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: expose filtered App operation outcomes.
import { computed } from 'vue'
import { useAppCollection } from '../../../../../app/composables/firestore/fetch/useAppCollection'
import { useFirestoreCollectionState } from '../../../../../composables/fireux/firestore/operations/useFirestoreCollection'
import type { App } from '../../../../../app/models/app.model.ts'
import { useProjectWorkspace } from '../../core/useProjectWorkspace'
import { useProjectWorkspaceEcosystem } from '../Ecosystem/useProjectWorkspaceEcosystem'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectWorkspaceApps() {
  const workspace = useProjectWorkspace()
  const { ecosystems } = useProjectWorkspaceEcosystem()
  const appCollectionPath = computed(() => 'apps')
  const {
    apps: appCollection,
    pending,
    error,
  } = useAppCollection(appCollectionPath)
  const apps = computed<App[]>(() => {
    const ecosystemIds = new Set(
      ecosystems.value.map((ecosystem) => normalizeString(ecosystem.id))
    )
    const seen = new Set<string>()
    return (appCollection.value ?? []).filter((entry) => {
      const id = normalizeString(entry.id)
      if (!id || seen.has(id)) return false
      if (!ecosystemIds.has(normalizeString(entry.ecosystem_id))) return false

      seen.add(id)
      return true
    }) as App[]
  })
  const count = computed(() => apps.value.length)
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(workspace.id.value)),
    count,
    error,
    pending,
  })

  return {
    selectedProject: workspace.data,
    projectId: workspace.id,
    apps,
    count,
    pending,
    error,
    outcome,
  }
}
