import { computed } from 'vue'
import type { Project } from '../../../../../../models/system/project.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectCollectionDoc = Partial<Project> & { id?: string }

export function useProjectCollection(collectionPath: string | { value?: string } = 'projects') {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path =
    typeof collectionPath === 'string'
      ? collectionPath
      : String(collectionPath?.value || 'projects').trim() || 'projects'
  const source = firestoreFetchCollection<ProjectCollectionDoc>(path)
  const projects = computed(() => source.value ?? [])
  const count = computed(() => projects.value.length)

  return { projects, count }
}
