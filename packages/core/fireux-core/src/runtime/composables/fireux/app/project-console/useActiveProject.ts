import { computed } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreRead } from '../../firestore/operations/useFirestoreRead'
import type { AppProject, Project } from '../../../../models/system/project.model'
import { useProjectFetch } from '../../firestore/system/project/fetch/useProjectFetch'
import { useProjectSelection } from './useProjectSelection'
import { getDemoProjectScenario } from './demo-scenarios'

/**
 * Active project loader.
 * Resolves the selected project as the console uses it:
 * - demo scenario when in demo mode
 * - otherwise root project + app-scoped overlay merged together
 */
export function useActiveProject() {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { selectedId: id, mode } = useProjectSelection()
  const isDemo = computed(() => mode.value === 'demo')
  const firestoreProjectId = computed(() => (isDemo.value ? '' : id.value))
  const { project: liveProject, pending: livePending } = useProjectFetch(firestoreProjectId)
  const overlayCollectionPath = computed(() =>
    isDemo.value || !appId ? '' : `apps/${String(appId || '').trim()}/projects`
  )
  const overlayCollection = computed(() => {
    const collectionPath = String(overlayCollectionPath.value || '').trim()
    if (!collectionPath) return null
    return firestoreFetchCollection<AppProject>(collectionPath)
  })
  const scenario = computed(() => {
    if (!isDemo.value || !id.value) return null
    return getDemoProjectScenario(id.value)
  })
  const overlay = computed(() => {
    const docId = String(id.value || '').trim()
    if (!docId) return null
    return (
      overlayCollection.value?.value?.find(
        (entry) => String(entry?.id || '').trim() === docId
      ) ?? null
    )
  })

  const project = computed(() => {
    if (!id.value) return null
    if (isDemo.value) return scenario.value?.project ?? null

    const rootProject = liveProject.value ?? null
    if (!rootProject) return null

    return {
      ...rootProject,
      ...(overlay.value ?? {}),
      id: String(rootProject.id || id.value).trim(),
    } as Project
  })

  const pending = computed(() => {
    if (!id.value) return false
    if (isDemo.value) return false
    return livePending.value || overlayCollection.value?.value === undefined
  })

  return {
    id,
    mode,
    isDemo,
    project,
    scenario,
    pending,
  }
}
