import { computed, isRef, type Ref } from 'vue'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useProjectInterface } from '../utils/view/useProjectInterface'
import { ProjectStorage } from '../../../../../../models/system/project.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useFirestoreCollectionState } from '../../../operations/useFirestoreCollection'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const PROJECT_COLLECTION_PATH = ProjectStorage.collection
const TEST_PROJECT_COLLECTION_PATH = 'test-projects'

export type ProjectCollectionFilterValue = string | number | null | undefined
export type ProjectCollectionFilter = {
  ids?: ProjectCollectionFilterValue[] | null | undefined
}
export type ProjectCollectionSource = ConsoleSource
type UseProjectCollectionOptions = {
  source?:
    | ProjectCollectionSource
    | Ref<ProjectCollectionSource | null | undefined>
    | null
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectCollection(
  options: UseProjectCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const { surface } = useProjectInterface()
  const sourceMode = computed<ProjectCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const collectionPath = computed(() => {
    if (sourceMode.value === 'demo') return ''
    return sourceMode.value === 'test'
      ? TEST_PROJECT_COLLECTION_PATH
      : PROJECT_COLLECTION_PATH
  })
  const resolvedFilter = computed<ProjectCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => String(value ?? '').trim())
          .filter(Boolean)
      )
  )
  const rootSource = firestoreFetchCollection<ProjectSurface>(collectionPath)

  const projects = computed<ProjectSurface[]>(() =>
    (rootSource.value ?? []).reduce<ProjectSurface[]>((acc, project) => {
      const id = String(project?.id || '').trim()
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc

      const item = surface({
        project: {
          ...project,
          id,
        },
      })
      if (item) acc.push(item)

      return acc
    }, [])
  )
  const count = computed(() => projects.value.length)
  const pending = computed(() =>
    sourceMode.value === 'demo' ? false : rootSource.pending.value
  )
  const error = computed<unknown | undefined>(() =>
    sourceMode.value === 'demo' ? undefined : rootSource.error.value
  )
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return {
    projects,
    count,
    pending,
    error,
    outcome,
  }
}
