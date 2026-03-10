import { computed } from 'vue'
import type { FireuxProjectModel } from '../../../../../../models/system/project.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectDoc = Partial<FireuxProjectModel> & { id?: string }

export function useProjectCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<ProjectDoc>('projects')
  const projects = computed(() => source.value ?? [])
  const count = computed(() => projects.value.length)

  return { projects, count }
}
