import { computed, isRef, type Ref } from 'vue'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

const PROJECT_COLLECTION_PATH = 'projects'
const TEST_PROJECT_COLLECTION_PATH = 'test-projects'

export type ProjectCollectionFilterValue = string | number | null | undefined
export type ProjectCollectionFilter = {
  ids?: ProjectCollectionFilterValue[] | null | undefined
}
export type ProjectCollectionSource = 'live' | 'demo' | 'test'

type UseProjectCollectionOptions = {
  source?: ProjectCollectionSource | Ref<ProjectCollectionSource | null | undefined> | null
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

function toDemoProjectSurface(
  project: ReturnType<typeof getDemoProjects>[number]
): ProjectSurface {
  const id = String(project.id || '').trim()

  return {
    id,
    slug: id,
    name: String(project.name || '').trim(),
    description: String(project.label || '').trim(),
    image_url: String(project.image_url || '').trim(),
    project_type: 'demo',
    status: 'active',
  }
}

export function useProjectCollection(
  options: UseProjectCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceMode = computed<ProjectCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const liveSource = firestoreFetchCollection<ProjectSurface>(PROJECT_COLLECTION_PATH)
  const testSource = firestoreFetchCollection<ProjectSurface>(TEST_PROJECT_COLLECTION_PATH)
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
  const demoProjects = computed<ProjectSurface[]>(() =>
    getDemoProjects().map(toDemoProjectSurface)
  )
  const collectionItems = computed<ProjectSurface[]>(() => {
    if (sourceMode.value === 'demo') return demoProjects.value
    return sourceMode.value === 'test'
      ? (testSource.value ?? [])
      : (liveSource.value ?? [])
  })

  const projects = computed<ProjectSurface[]>(() =>
    collectionItems.value.reduce<ProjectSurface[]>((acc, project) => {
      const id = String(
        project?.id ||
          project?.slug ||
          project?.app_id ||
          project?.firebase_project_id ||
          ''
      ).trim()
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc

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
    return sourceMode.value === 'test'
      ? testSource.value === undefined
      : liveSource.value === undefined
  })

  return {
    projects,
    count,
    pending,
  }
}
