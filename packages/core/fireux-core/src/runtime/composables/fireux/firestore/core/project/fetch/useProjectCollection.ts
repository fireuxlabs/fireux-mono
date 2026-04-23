import { computed, isRef, type Ref } from 'vue'
import { getDemoProjectScenarios } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

const PROJECT_COLLECTION_PATH = 'projects'
const TEST_PROJECT_COLLECTION_PATH = 'test-projects'

export type ProjectCollectionFilterValue = string | number | null | undefined
export type ProjectCollectionFilter = {
  ids?: ProjectCollectionFilterValue[] | null | undefined
  teamId?: ProjectCollectionFilterValue
}
export type ProjectCollectionSource = 'live' | 'demo' | 'test'

type UseProjectCollectionOptions = {
  source?: ProjectCollectionSource | Ref<ProjectCollectionSource | null | undefined> | null
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

const toDemoProjectSurface = (
  scenario: ReturnType<typeof getDemoProjectScenarios>[number]
): ProjectSurface => ({ ...scenario.project })

export function useProjectCollection(
  options: UseProjectCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceMode = computed<ProjectCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const resolvedFilter = computed<ProjectCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterTeamId = computed(() =>
    String(resolvedFilter.value?.teamId ?? '').trim()
  )
  const hasTeamFilter = computed(() =>
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
  const demoProjects = computed<ProjectSurface[]>(() =>
    getDemoProjectScenarios().map(toDemoProjectSurface)
  )
  const firestoreSource = computed(() => {
    if (sourceMode.value === 'demo') return null

    const collectionPath =
      sourceMode.value === 'test'
        ? TEST_PROJECT_COLLECTION_PATH
        : PROJECT_COLLECTION_PATH

    return firestoreFetchCollection<ProjectSurface>(collectionPath)
  })
  const collectionItems = computed<ProjectSurface[]>(() => {
    if (sourceMode.value === 'demo') return demoProjects.value
    return firestoreSource.value?.value ?? []
  })

  const projects = computed<ProjectSurface[]>(() =>
    collectionItems.value.reduce<ProjectSurface[]>((acc, project) => {
      const id = String(project?.id || '').trim()
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasTeamFilter.value) {
        if (!filterTeamId.value) return acc
        const teamIds = Array.isArray(project?.team_ids)
          ? project.team_ids.map((value) => String(value ?? '').trim())
          : []
        if (!teamIds.includes(filterTeamId.value)) return acc
      }

      acc.push({
        ...project,
        id,
      })

      return acc
    }, [])
  )
  const count = computed(() => projects.value.length)
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    return firestoreSource.value?.value === undefined
  })

  return {
    projects,
    count,
    pending,
  }
}
