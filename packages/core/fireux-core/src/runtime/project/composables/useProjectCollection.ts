import { resolveReadOutcome } from '../../composables/fireux/firestore/operations/read-outcome'
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { useProjectAccess } from './useProjectAccess'
import type { FirestoreCollectionOutcome } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import type { FirestoreCollectionSource } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import type { Project } from '../models/project.model'

export type ProjectCollectionFilterValue = string | number | null | undefined
export type ProjectCollectionFilter = {
  ids?: ProjectCollectionFilterValue[] | null
}
export type ProjectCollectionSource = FirestoreCollectionSource
type UseProjectCollectionOptions = {
  source?: ProjectCollectionSource | Ref<ProjectCollectionSource | null> | null
  filter?:
    | ProjectCollectionFilter
    | Ref<ProjectCollectionFilter | null | undefined>
    | null
}

export type UseProjectCollectionReturn = {
  projects: ComputedRef<Project[]>
  projectIds: ComputedRef<string[]>
  access: ReturnType<typeof useProjectAccess>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<FirestoreCollectionOutcome>
}

/** Live, membership-bounded Project collection. */
export function useProjectCollection(
  options: UseProjectCollectionOptions = {}
): UseProjectCollectionReturn {
  const access = useProjectAccess()
  const { firestoreLoadDocsByIds } = useFirestoreRead()
  const sourceMode = computed<ProjectCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const filter = computed<ProjectCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const projectIds = computed(() => {
    const requested = filter.value?.ids
    if (!Array.isArray(requested)) return access.ids.value
    const allowed = new Set(access.ids.value)
    return requested
      .map((id) => String(id || '').trim())
      .filter((id) => id && allowed.has(id))
  })
  const source = firestoreLoadDocsByIds<Project>({
    collectionPath: computed(() =>
      sourceMode.value === 'live' ? 'projects' : ''
    ),
    ids: projectIds,
  })
  const projects = computed(() => {
    const allowed = new Set(projectIds.value)
    return (source.docs.value ?? []).filter((project) =>
      allowed.has(project.id)
    )
  })
  const pending = computed(
    () => access.pending.value || source.outcome.value === 'pending'
  )
  const error = computed(() => access.error.value ?? source.error.value)
  const outcome = computed(() => resolveReadOutcome({
    kind: 'collection', active: sourceMode.value === 'live',
    pending: pending.value, error: error.value, present: projects.value.length > 0,
  }))

  return {
    projects,
    projectIds,
    access,
    count: computed(() => projects.value.length),
    pending,
    error,
    outcome,
  }
}
