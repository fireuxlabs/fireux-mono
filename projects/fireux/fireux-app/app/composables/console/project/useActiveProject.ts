import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { computed, ref } from 'vue'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useProjectSelection } from './useProjectSelection'

type ActiveProjectRecord = Partial<Project> & Record<string, unknown> & {
  id?: string
}

/**
 * Live project loader.
 * Loads the selected project document from `projects/<id>`.
 */
export function useActiveProject() {
  const { selectedId: id } = useProjectSelection()
  const db = import.meta.server ? null : useFirestore()

  const projectRef = computed(() => {
    if (!db || !id.value) return null
    return doc(db, 'projects', id.value)
  })

  const liveProject =
    import.meta.server || !db
      ? {
          data: ref<ActiveProjectRecord | null>(null),
          pending: ref(false),
        }
      : useDocument<ActiveProjectRecord | null>(projectRef as any, {
          transform: (docSnap: DocumentSnapshot<ActiveProjectRecord>) => {
            const raw = docSnap.data()
            if (!raw) return null
            return { ...(raw as any), id: docSnap.id } as ActiveProjectRecord
          },
        } as any)

  const project = computed<ActiveProjectRecord | null>(() => {
    if (!id.value) return null
    return liveProject.data?.value ?? null
  })

  const pending = computed(() => Boolean(liveProject.pending?.value))

  return {
    id,
    project,
    pending,
  }
}