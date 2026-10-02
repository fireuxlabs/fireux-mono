// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: expose filtered Ecosystem operation outcomes.
import { computed } from 'vue'
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import { useEcosystemCollection } from 'fireux-core/runtime/ecosystem/composables/useEcosystemCollection'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useProjectWorkspace } from '../../core/useProjectWorkspace'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectWorkspaceEcosystem() {
  const workspace = useProjectWorkspace()

  const ecosystemCollectionPath = computed(() => 'ecosystems')
  const {
    ecosystems: ecosystemCollection,
    pending,
    error,
  } = useEcosystemCollection(ecosystemCollectionPath)
  const ecosystems = computed<Ecosystem[]>(() => {
    const projectId = normalizeString(workspace.id.value)
    if (!projectId) return []

    return (ecosystemCollection.value ?? []).filter(
      (entry: Ecosystem) => normalizeString(entry.project_id) === projectId
    )
  })
  const count = computed(() => ecosystems.value.length)
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(workspace.id.value)),
    count,
    error,
    pending,
  })

  return {
    selectedProject: workspace.data,
    projectId: workspace.id,
    ecosystems,
    count,
    pending,
    error,
    outcome,
  }
}
