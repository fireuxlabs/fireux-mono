import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from '../../../vuefire'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectCollectionDoc = ProjectSurface & {
  team_ids?: string[]
}
type ProjectCollectionScope = 'all' | 'mine'

type UseProjectCollectionOptions = {
  collectionPath?: string | Ref<string>
  scope?: ProjectCollectionScope | Ref<ProjectCollectionScope>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'projects'

export function useProjectCollection(options: UseProjectCollectionOptions = {}) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreQuery } = useFirestoreRead()
  const { uid } = useAuth()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())
  const scopeRef = isRef(options.scope)
    ? options.scope
    : computed<ProjectCollectionScope>(() => options.scope || 'all')
  const currentUid = computed(() => String(uid.value || '').trim())

  const rootSource = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    if (scopeRef.value !== 'mine') {
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

  const projects = computed(() =>
    (rootSource.value?.value ?? [])
      .map((project) => {
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
    if (scopeRef.value === 'mine' && !currentUid.value) return false
    return rootSource.value?.value === undefined
  })

  return {
    projects,
    count,
    pending,
  }
}
