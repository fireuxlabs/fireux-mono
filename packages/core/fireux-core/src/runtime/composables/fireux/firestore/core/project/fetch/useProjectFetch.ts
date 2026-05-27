import { computed, isRef, type Ref } from 'vue'
import { getDemoProject } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useProjectInterface } from '../utils/view/useProjectInterface'
import { ProjectStorage } from '../../../../../../models/system/project.model'
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

const DEFAULT_COLLECTION_PATH = ProjectStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-projects'

function resolveMaybeRef<T>(value: T | Ref<T>): T {
  return isRef(value) ? value.value : value
}

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

function resolveDefaultDemoProject(projectId: string): ProjectFetchDoc | null {
  const scenario = getDemoProject(projectId)
  if (!scenario) return null

  return { ...scenario.project }
}

export function useProjectFetch(
  id: string | null | Ref<string | null>,
  options: UseProjectFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { surface } = useProjectInterface()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const sourceRef = computed<ProjectFetchSource>(() => {
    if (isRef(options.source)) return options.source.value
    return options.source ?? 'live'
  })
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
      const configuredDemo = resolveMaybeRef(options.demoProject ?? null)
      const entry = normalizeProject(configuredDemo ?? resolveDefaultDemoProject(docId))
      return surface({ project: entry }) as ProjectFetchDoc | null
    }

    if (sourceRef.value === 'api') {
      const apiEntry = resolveMaybeRef(options.apiProject ?? null)
      return surface({ project: normalizeProject(apiEntry ?? null) }) as ProjectFetchDoc | null
    }

    const entry = firestoreSource.value?.value
    return surface({ project: normalizeProject(entry) }) as ProjectFetchDoc | null
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
