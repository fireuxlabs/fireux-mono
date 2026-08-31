// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: expose filtered Ecosystem operation outcomes.
import { computed } from 'vue'
import type { Ecosystem } from '../../../../../ecosystem/models/ecosystem.model'
import { useEcosystemCollection } from '../../../../../ecosystem/composables/firestore/fetch/useEcosystemCollection'
import { useFirestoreCollectionState } from '../../../../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useProjectWorkspace } from '../../core/useProjectWorkspace'
import {
  findProjectWorkspaceDemoScenario,
  useProjectWorkspaceDemoData,
} from '../../core/useProjectWorkspaceDemoData'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectWorkspaceEcosystem() {
  const { selection, runtime } = useProjectWorkspace()

  const ecosystemCollectionPath = computed(() =>
    runtime.dataType.value === 'live' ? 'ecosystems' : ''
  )
  const {
    ecosystems: ecosystemCollection,
    pending,
    error,
  } = useEcosystemCollection(ecosystemCollectionPath)
  const demoData = useProjectWorkspaceDemoData(
    runtime.isDemo
  )
  const ecosystems = computed<Ecosystem[]>(() => {
    const projectId = normalizeString(selection.projectId.value)
    if (!projectId) return []

    const source =
      runtime.isDemo.value
        ? (findProjectWorkspaceDemoScenario(demoData.data.value, projectId)
            ?.ecosystems ?? [])
        : (ecosystemCollection.value ?? [])
    return source.filter(
      (entry: Ecosystem) => normalizeString(entry.project_id) === projectId
    )
  })
  const count = computed(() => ecosystems.value.length)
  const { outcome } = useFirestoreCollectionState({
    active: computed(
      () =>
        runtime.isDemo.value ||
        Boolean(ecosystemCollectionPath.value)
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
    ecosystemsCount: count.value,
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
    ecosystems,
    count,
    pending,
    error,
    outcome,
    debug,
  }
}
