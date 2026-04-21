import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from '../../../vuefire'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectCollectionDoc = ProjectSurface & {
  team_ids?: string[]
}
type ProjectCollectionScope = 'all' | 'mine'
type ProjectCollectionSource = 'live' | 'test' | 'demo'

type UseProjectCollectionOptions = {
  collectionPath?: string | Ref<string>
  scope?: ProjectCollectionScope | Ref<ProjectCollectionScope>
  source?: ProjectCollectionSource | Ref<ProjectCollectionSource>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'projects'
const TEST_COLLECTION_PATH = 'test-projects'

function resolveMaybeRef<T>(value: T | Ref<T> | undefined, fallback: T): T {
  if (isRef(value)) return value.value
  return value ?? fallback
}

function toDemoProjectSurface(project: ReturnType<typeof getDemoProjects>[number]): ProjectCollectionDoc {
  return {
    id: String(project.id || '').trim(),
    slug: String(project.id || '').trim(),
    name: String(project.name || '').trim(),
    description: String(project.label || '').trim(),
    image_url: project.image_url,
    project_type: 'demo',
    status: 'active',
  }
}

export function useProjectCollection(options: UseProjectCollectionOptions = {}) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreQuery } = useFirestoreRead()
  const { uid } = useAuth()
  const sourceRef = computed<ProjectCollectionSource>(() =>
    resolveMaybeRef(options.source, 'live')
  )
  const pathRef = computed(() => {
    const explicitPath = String(resolveMaybeRef(options.collectionPath, '') || '').trim()
    if (explicitPath) return explicitPath
    return sourceRef.value === 'test' ? TEST_COLLECTION_PATH : DEFAULT_COLLECTION_PATH
  })
  const scopeRef = computed<ProjectCollectionScope>(() =>
    resolveMaybeRef(options.scope, 'all')
  )
  const currentUid = computed(() => String(uid.value || '').trim())

  const rootSource = computed(() => {
    if (sourceRef.value === 'demo') return null

    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    if (sourceRef.value !== 'live' || scopeRef.value !== 'mine') {
      return firestoreFetchCollection<ProjectCollectionDoc>(collectionPath)
    }

    const memberId = currentUid.value
    if (!memberId) return null

    const q = fsq(
      collection(db, collectionPath),
      where('team_ids', 'array-contains', memberId)
    ) as Query<ProjectCollectionDoc>
    return firestoreQuery<ProjectCollectionDoc>(
      q,
      `${collectionPath}-team-${memberId}`,
      collectionPath
    )
  })

  const demoProjects = computed<ProjectCollectionDoc[]>(() =>
    getDemoProjects().map(toDemoProjectSurface)
  )

  const projects = computed(() =>
    (sourceRef.value === 'demo' ? demoProjects.value : (rootSource.value?.value ?? []))
      .map((project: ProjectCollectionDoc | null | undefined) => {
        const id = String(project?.id || '').trim()
        if (!id) return null

        return {
          ...project,
          id,
        }
      })
      .filter((project): project is ProjectCollectionDoc => Boolean(project?.id))
  )

  const count = computed(() => projects.value.length)
  const pending = computed(() => {
    if (sourceRef.value === 'demo') return false
    if (scopeRef.value === 'mine' && !currentUid.value) return false
    return rootSource.value?.value === undefined
  })

  return {
    projects,
    count,
    pending,
  }
}
