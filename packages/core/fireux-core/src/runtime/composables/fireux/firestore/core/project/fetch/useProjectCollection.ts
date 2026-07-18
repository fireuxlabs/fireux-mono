import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useProjectInterface } from '../utils/view/useProjectInterface'
import { ProjectStorage } from '../../../../../../models/system/project.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useFirestoreCollectionState } from '../../../operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { targetHasConsoleAccess } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const PROJECT_COLLECTION_PATH = ProjectStorage.rootCollection
const TEST_PROJECT_COLLECTION_PATH = 'test-projects'

export type ProjectCollectionFilterValue = string | number | null | undefined
export type ProjectCollectionFilter = {
  ids?: ProjectCollectionFilterValue[] | null | undefined
  operatorId?: ProjectCollectionFilterValue
  teamId?: ProjectCollectionFilterValue
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
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreQuery } = useFirestoreRead()
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
  const filterOperatorId = computed(() =>
    String(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId ?? '').trim()
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => String(value ?? '').trim())
          .filter(Boolean)
      )
  )
  const rootSource = firestoreFetchCollection<ProjectSurface>(collectionPath)
  const operatorQuery = computed<Query<ProjectSurface> | null>(() => {
    if (!collectionPath.value) return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, collectionPath.value),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<ProjectSurface>
  })
  const teamQuery = computed<Query<ProjectSurface> | null>(() => {
    if (!collectionPath.value) return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, collectionPath.value),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<ProjectSurface>
  })
  const operatorSource = firestoreQuery<ProjectSurface>(
    operatorQuery,
    undefined,
    collectionPath
  )
  const teamSource = firestoreQuery<ProjectSurface>(
    teamQuery,
    undefined,
    collectionPath
  )
  const operatorTeamSource = computed<ProjectSurface[]>(() => {
    const byId = new Map<string, ProjectSurface>()

    for (const project of [
      ...(operatorSource.value ?? []),
      ...(teamSource.value ?? []),
    ]) {
      const id = String(project?.id || '').trim()
      if (id) byId.set(id, { ...project, id })
    }

    return [...byId.values()]
  })
  const firestoreSource = computed(() =>
    !hasOperatorFilter.value || !filterOperatorId.value ? rootSource : null
  )
  const collectionItems = computed<ProjectSurface[]>(() => {
    if (hasOperatorFilter.value && filterOperatorId.value) {
      return operatorTeamSource.value
    }
    return firestoreSource.value?.value ?? []
  })

  const projects = computed<ProjectSurface[]>(() =>
    collectionItems.value.reduce<ProjectSurface[]>((acc, project) => {
      const id = String(project?.id || '').trim()
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        if (!targetHasConsoleAccess(project, filterOperatorId.value)) return acc
      }

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
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (hasOperatorFilter.value && filterOperatorId.value) {
      return operatorSource.pending.value || teamSource.pending.value
    }
    if (hasOperatorFilter.value) return false
    return rootSource.pending.value
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (hasOperatorFilter.value && filterOperatorId.value) {
      return operatorSource.error.value ?? teamSource.error.value
    }
    if (hasOperatorFilter.value) return undefined
    return rootSource.error.value
  })
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
