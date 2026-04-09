import { computed, isRef, type Ref } from 'vue'
import type { Project } from '../../../../../../models/system/project.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectCollectionDoc = Partial<Project> & { id?: string }

type UseProjectCollectionOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'projects'

export function useProjectCollection(options: UseProjectCollectionOptions = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())

  const source = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    return firestoreFetchCollection<ProjectCollectionDoc>(collectionPath)
  })

  const projects = computed(() =>
    (source.value?.value ?? [])
      .map((project) => ({
        ...project,
        id: String(project?.id || '').trim(),
      }))
      .filter((project) => Boolean(project.id))
  )

  const count = computed(() => projects.value.length)
  const pending = computed(() => source.value?.value === undefined)

  return {
    projects,
    count,
    pending,
  }
}
