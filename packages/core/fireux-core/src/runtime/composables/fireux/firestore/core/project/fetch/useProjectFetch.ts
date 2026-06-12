import { computed, isRef, type Ref } from 'vue'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useProjectInterface } from '../utils/view/useProjectInterface'
import { ProjectStorage } from '../../../../../../models/system/project.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectFetchDoc = ProjectSurface

type UseProjectFetchOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = ProjectStorage.rootCollection

function normalizeProject(
  entry: ProjectFetchDoc | null | undefined
): ProjectFetchDoc | null {
  if (!entry) return null

  const id = String(entry.id || '').trim()
  if (!id) return null

  return {
    ...entry,
    id,
  }
}

export function useProjectFetch(
  id: string | null | Ref<string | null>,
  options: UseProjectFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { surface } = useProjectInterface()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const pathRef = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    if (String(configuredPath || '').trim()) {
      return String(configuredPath || '').trim()
    }

    return DEFAULT_COLLECTION_PATH
  })

  const firestoreSource = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (!docId) return null
    return firestoreFetchDoc<ProjectFetchDoc>(collectionPath, docId)
  })

  const project = computed<ProjectFetchDoc | null>(() => {
    const entry = firestoreSource.value?.value
    return surface({ project: normalizeProject(entry) }) as ProjectFetchDoc | null
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()

    if (!docId) return false
    return firestoreSource.value?.value === undefined
  })

  return {
    project,
    pending,
  }
}
