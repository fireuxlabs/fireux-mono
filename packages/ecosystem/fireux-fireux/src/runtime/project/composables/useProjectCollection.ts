import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { useProjectAccess } from './useProjectAccess'
import type { FirestoreCollectionOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import type { FirestoreCollectionSource } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Project } from '../models/project.model'
import { readProjectDocument } from '../utils/readProject'

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
  const source = firestoreLoadDocsByIds<Record<string, unknown> & { id: string }>({
    collectionPath: computed(() =>
      sourceMode.value === 'live' ? 'projects' : ''
    ),
    ids: projectIds,
  })
  const parsed = computed(() => {
    const allowed = new Set(projectIds.value), items: Project[] = [], invalidIds: string[] = []
    for (const record of source.docs.value ?? []) {
      if (!allowed.has(record.id)) continue
      const project = readProjectDocument(record, record.id)
      if (project) items.push(project)
      else invalidIds.push(record.id)
    }
    return { items, invalidIds }
  })
  const pending = computed(() => access.pending.value || source.outcome.value === 'pending')
  const error = computed(() => access.error.value ?? source.error.value ?? (
    source.outcome.value === 'ready' && parsed.value.invalidIds.length
      ? new Error('Project source is invalid.') : undefined
  ))
  const outcome = computed(() => resolveReadOutcome({
    kind: 'collection', active: sourceMode.value === 'live',
    pending: pending.value, error: error.value, present: parsed.value.items.length > 0,
  }))
  const projects = computed(() => outcome.value === 'ready' ? parsed.value.items : [])

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
