import {
  collection,
  documentId,
  query,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { useAppSession } from '../../app/composables/useAppSession'
import type { FirestoreCollectionOutcome } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import type { FirestoreCollectionSource } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreResolver } from '../../composables/fireux/firestore/vuefire'
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
  primaryProject: ComputedRef<string>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<FirestoreCollectionOutcome>
}

/** Live, membership-bounded Project collection. */
export function useProjectCollection(
  options: UseProjectCollectionOptions = {}
): UseProjectCollectionReturn {
  const app = useAppSession()
  const resolveDb = useFirestoreResolver()
  const { firestoreQuery } = useFirestoreRead()
  const sourceMode = computed<ProjectCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const filter = computed<ProjectCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const membershipIds = computed(() =>
    (app.appUser.value?.projects ?? [])
      .map((id) => String(id || '').trim())
      .filter(Boolean)
  )
  const projectIds = computed(() => {
    const requested = filter.value?.ids
    if (!Array.isArray(requested)) return membershipIds.value
    const allowed = new Set(membershipIds.value)
    return requested
      .map((id) => String(id || '').trim())
      .filter((id) => id && allowed.has(id))
  })
  const projectQuery = computed<Query<Project> | null>(() => {
    if (sourceMode.value !== 'live' || !projectIds.value.length) return null
    return query(
      collection(resolveDb(), 'projects'),
      where(documentId(), 'in', projectIds.value)
    ) as Query<Project>
  })
  const source = firestoreQuery<Project>(
    projectQuery,
    'workspace-projects',
    'projects'
  )
  const projects = computed(() => source.value ?? [])
  const pending = computed(
    () => app.pending.value || source.outcome.value === 'pending'
  )
  const error = computed(() => app.error.value ?? source.error.value)
  const outcome = computed<FirestoreCollectionOutcome>(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return projects.value.length ? 'ready' : 'empty'
  })

  return {
    projects,
    projectIds,
    primaryProject: computed(() => app.appUser.value?.primary_project ?? ''),
    count: computed(() => projects.value.length),
    pending,
    error,
    outcome,
  }
}
