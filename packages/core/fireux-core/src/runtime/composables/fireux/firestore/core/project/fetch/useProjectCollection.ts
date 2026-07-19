import { useAsyncData } from '#imports'
import { computed, isRef, type Ref } from 'vue'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useProjectInterface } from '../utils/view/useProjectInterface'
import { useFirestoreCollectionState } from '../../../operations/useFirestoreCollection'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useAuth } from '../../../../firebase/useAuth'

type ProjectControlResponse = {
  ok: true
  items: ProjectSurface[]
}

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
  const { surface } = useProjectInterface()
  const { currentUser, hasAuthState } = useAuth()
  const sourceMode = computed<ProjectCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
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
  const requestKey = computed(
    () =>
      `project-control-${sourceMode.value}-${currentUser.value?.uid || 'anonymous'}`
  )
  const {
    data,
    pending: requestPending,
    error: requestError,
    refresh,
  } = useAsyncData<ProjectControlResponse>(
    requestKey,
    async () => {
      if (sourceMode.value === 'demo' || import.meta.server) {
        return { ok: true, items: [] }
      }

      const user = currentUser.value
      if (!user) return { ok: true, items: [] }

      const token = await user.getIdToken()
      return $fetch<ProjectControlResponse>('/api/internal/control/projects', {
        query: { source: sourceMode.value },
        headers: { authorization: `Bearer ${token}` },
      })
    },
    {
      server: false,
      lazy: false,
      watch: [currentUser, hasAuthState, sourceMode],
    }
  )
  const rootSource = computed<ProjectSurface[]>(() =>
    currentUser.value ? data.value?.items ?? [] : []
  )

  const projects = computed<ProjectSurface[]>(() =>
    rootSource.value.reduce<ProjectSurface[]>((acc, project) => {
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
    sourceMode.value === 'demo'
      ? false
      : !hasAuthState.value || requestPending.value
  )
  const error = computed<unknown | undefined>(() =>
    sourceMode.value === 'demo' ? undefined : requestError.value ?? undefined
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
    refresh,
  }
}
