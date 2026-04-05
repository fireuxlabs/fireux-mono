import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, ref } from 'vue'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { getDemoProjectScenario } from './demo-scenarios'
import { useRuntimeProjectSelection } from './state'

type RuntimeProject = Partial<Project> & Record<string, unknown> & {
  id?: string
  name?: string
  project_name?: string
}

const resolveProjectCollectionPath = (mode: string) =>
  mode === 'test' ? 'test-projects' : 'projects'

/**
 * Canon project console seam.
 */
export function useRuntimeProject() {
  const selection = useRuntimeProjectSelection()
  const id = selection.selectedId
  const mode = selection.mode
  const activity = computed<'static'>(() => 'static')
  const isDemo = computed(() => selection.mode.value === 'demo')
  const documentCollectionPath = computed(() => resolveProjectCollectionPath(mode.value))

  const db = import.meta.server ? null : useFirestore()
  const liveDocRef = computed(() => {
    if (!db) return null
    if (!id.value || isDemo.value) return null
    return doc(db, documentCollectionPath.value, id.value)
  })

  const liveProject =
    import.meta.server || !db
      ? {
          data: ref<RuntimeProject | null>(null),
          pending: ref(false),
        }
      : useDocument<RuntimeProject | null>(liveDocRef as any, {
          transform: (docSnap: DocumentSnapshot<RuntimeProject>) => {
            const raw = docSnap.data()
            if (!raw) return null
            return { ...(raw as any), id: docSnap.id } as RuntimeProject
          },
        } as any)

  const scenario = computed(() =>
    isDemo.value ? getDemoProjectScenario(id.value) : null
  )

  const project = computed<RuntimeProject | null>(() => {
    if (!id.value) return null
    if (isDemo.value) return (scenario.value?.project as RuntimeProject) ?? null
    return liveProject.data?.value ?? null
  })

  const pending = computed(() => !isDemo.value && Boolean(liveProject.pending?.value))

  return {
    id,
    mode,
    activity,
    isDemo,
    pending,
    scenario,
    project,
  }
}
