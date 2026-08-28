import { useAsyncData } from '#imports'
import type { AsyncData } from 'nuxt/app'
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import type { FirestoreCollectionOutcome } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreCollectionState } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import type { FirestoreCollectionSource } from '../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import type { Project } from '../models/project.model'

const text = (value: unknown) => String(value ?? '').trim()

type ProjectControlResponse = {
  ok: true
  items: Project[]
}

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
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<FirestoreCollectionOutcome>
  refresh: AsyncData<unknown, unknown>['refresh']
}

export function useProjectCollection(
  options: UseProjectCollectionOptions = {}
): UseProjectCollectionReturn {
  const { currentUser, hasAuthState } = useAuth()
  const sourceMode = computed<ProjectCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const filter = computed<ProjectCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const filterIds = computed(() =>
    Array.isArray(filter.value?.ids)
      ? new Set(
          filter.value.ids
            .map((value) => String(value ?? '').trim())
            .filter(Boolean)
        )
      : null
  )
  const requestKey = computed(
    () => `project-control-${currentUser.value?.uid || 'anonymous'}`
  )
  const {
    data,
    pending: requestPending,
    error: requestError,
    refresh,
  } = useAsyncData<ProjectControlResponse>(
    requestKey,
    async () => {
      if (sourceMode.value !== 'live' || import.meta.server) {
        return { ok: true, items: [] }
      }
      const user = currentUser.value
      if (!user) return { ok: true, items: [] }
      return $fetch<ProjectControlResponse>('/api/internal/control/projects', {
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      })
    },
    {
      server: false,
      lazy: false,
      watch: [currentUser, hasAuthState, sourceMode],
    }
  )
  const projects = computed<Project[]>(() =>
    (currentUser.value ? (data.value?.items ?? []) : []).filter(
      (project: Project) =>
        !filterIds.value || filterIds.value.has(text(project.id))
    )
  )
  const count = computed(() => projects.value.length)
  const pending = computed(() =>
    sourceMode.value === 'live'
      ? !hasAuthState.value || requestPending.value
      : false
  )
  const error = computed<unknown | undefined>(() =>
    sourceMode.value === 'live' ? (requestError.value ?? undefined) : undefined
  )
  const { outcome } = useFirestoreCollectionState({ count, error, pending })

  return { projects, count, pending, error, outcome, refresh }
}
