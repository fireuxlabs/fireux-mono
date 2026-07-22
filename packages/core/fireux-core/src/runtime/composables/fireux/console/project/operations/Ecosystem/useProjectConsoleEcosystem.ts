// Concurrent edit — 2026-07-20 16:19 CEST — Console Spine project cleanup: expose filtered Ecosystem operation outcomes.
import { computed } from 'vue'
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useProjectConsole } from '../../core/useProjectConsole'
import {
  findProjectConsoleDemoScenario,
  useProjectConsoleDemoData,
} from '../../core/useProjectConsoleDemoData'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleEcosystem() {
  const { selection, runtime } = useProjectConsole()

  const ecosystemCollectionPath = computed(() =>
    runtime.source.value === 'live' ? 'ecosystems' : ''
  )
  const {
    ecosystems: ecosystemCollection,
    pending,
    error,
  } = useEcosystemCollection(ecosystemCollectionPath)
  const demoData = useProjectConsoleDemoData(
    computed(() => runtime.source.value === 'demo')
  )
  const ecosystems = computed(() => {
    const projectId = normalizeString(selection.projectId.value)
    if (!projectId) return []

    const source =
      runtime.source.value === 'demo'
        ? (findProjectConsoleDemoScenario(demoData.data.value, projectId)
            ?.ecosystems ?? [])
        : (ecosystemCollection.value ?? [])
    return source.filter(
      (entry) => normalizeString(entry.project_id) === projectId
    )
  })
  const count = computed(() => ecosystems.value.length)
  const { outcome } = useFirestoreCollectionState({
    active: computed(
      () =>
        runtime.source.value === 'demo' ||
        Boolean(ecosystemCollectionPath.value)
    ),
    count,
    error,
    pending: computed(() =>
      runtime.source.value === 'demo' ? demoData.pending.value : pending.value
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
