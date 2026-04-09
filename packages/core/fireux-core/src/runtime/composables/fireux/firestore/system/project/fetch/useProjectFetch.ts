import { computed } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import type { Project } from '../../../../../../models/system/project.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectFetchDoc = Partial<Project> & { id?: string }

type UseProjectFetchOptions = {
  collectionPath?: string
}

const projectCollection = 'projects'

export function useProjectFetch(options: UseProjectFetchOptions = {}) {
  const collectionPath =
    String(options.collectionPath || projectCollection).trim() || projectCollection
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<ProjectFetchDoc>(collectionPath)

  const projects = computed(() =>
    (source.value ?? [])
      .map((project) => ({
        ...project,
        id: String(project?.id || '').trim(),
      }))
      .filter((project) => Boolean(project.id))
  )

  const { byId: project } = useCollectionById(projects)
  const pending = computed(() => source.value === undefined)

  return {
    projects,
    project,
    pending,
  }
}
