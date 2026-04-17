import { computed, isRef, type Ref } from 'vue'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectFetchDoc = ProjectSurface

export type ProjectFetchSource = 'live' | 'demo' | 'test' | 'api'

type UseProjectFetchOptions = {
  source?: ProjectFetchSource | Ref<ProjectFetchSource>
  collectionPath?: string | Ref<string>
  demoProject?: ProjectFetchDoc | null | Ref<ProjectFetchDoc | null>
  apiProject?: ProjectFetchDoc | null | undefined | Ref<ProjectFetchDoc | null | undefined>
  apiPending?: boolean | Ref<boolean>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'projects'
const TEST_COLLECTION_PATH = 'test-projects'

function resolveMaybeRef<T>(value: T | Ref<T>): T {
  return isRef(value) ? value.value : value
}

function normalizeProject(
  entry: ProjectFetchDoc | null | undefined,
  fallbackId: string
): ProjectFetchDoc | null {
  if (!entry) return null

  const id = String(entry.id || fallbackId).trim()
  if (!id) return null

  return {
    ...entry,
    id,
  }
}

export function useProjectFetch(
  id: string | Ref<string>,
  options: UseProjectFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const sourceRef = isRef(options.source)
    ? options.source
    : computed<ProjectFetchSource>(() => options.source || 'live')
  const pathRef = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    if (String(configuredPath || '').trim()) {
      return String(configuredPath || '').trim()
    }

    return sourceRef.value === 'test' ? TEST_COLLECTION_PATH : DEFAULT_COLLECTION_PATH
  })

  const firestoreSource = computed(() => {
    if (sourceRef.value !== 'live' && sourceRef.value !== 'test') return null

    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (!docId) return null
    return firestoreFetchDoc<ProjectFetchDoc>(collectionPath, docId)
  })

  const project = computed<ProjectFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()

    if (sourceRef.value === 'demo') {
      return normalizeProject(resolveMaybeRef(options.demoProject ?? null), docId)
    }

    if (sourceRef.value === 'api') {
      const apiEntry = resolveMaybeRef(options.apiProject ?? null)
      return normalizeProject(apiEntry ?? null, docId)
    }

    const entry = firestoreSource.value?.value
    return normalizeProject(entry, docId)
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()

    if (sourceRef.value === 'demo') return false

    if (sourceRef.value === 'api') {
      return Boolean(resolveMaybeRef(options.apiPending ?? false))
    }

    if (!docId) return false
    return firestoreSource.value?.value === undefined
  })

  return {
    project,
    pending,
  }
}
