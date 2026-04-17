import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ProjectSurface } from '../utils/view/useProjectInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ProjectCollectionDoc = ProjectSurface

type UseProjectCollectionOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'projects'

export function useProjectCollection(options: UseProjectCollectionOptions = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())

  const rootSource = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    return firestoreFetchCollection<ProjectCollectionDoc>(collectionPath)
  })

  const overlaySource = computed(() => {
    const resolvedAppId = String(appId || '').trim()
    if (!resolvedAppId) return null
    return firestoreFetchCollection<
      Partial<ProjectCollectionDoc> & { id?: string; team_ids?: string[]; admin_ids?: string[] }
    >(`apps/${resolvedAppId}/${DEFAULT_COLLECTION_PATH}`)
  })

  const projects = computed(() =>
    {
      const projectsById = new Map<string, ProjectCollectionDoc>()
      for (const project of rootSource.value?.value ?? []) {
        const id = String(project?.id || '').trim()
        if (!id) continue
        projectsById.set(id, {
          ...project,
          id,
        })
      }

      const currentUid = String(uid.value || '').trim()
      if (!currentUid) return []

      return (overlaySource.value?.value ?? [])
        .map((overlay) => {
          const id = String(overlay?.id || '').trim()
          const teamIds = Array.isArray((overlay as any)?.team_ids)
            ? (overlay as any).team_ids
            : Array.isArray((overlay as any)?.admin_ids)
              ? (overlay as any).admin_ids
              : []

          return {
            id,
            teamIds: teamIds
              .map((value: unknown) => String(value || '').trim())
              .filter(Boolean),
            overlay,
          }
        })
        .filter((entry) => Boolean(entry.id) && entry.teamIds.includes(currentUid))
        .map((entry) => ({
          ...(projectsById.get(entry.id) ?? {}),
          ...(entry.overlay ?? {}),
          id: entry.id,
        }))
        .filter((project) => Boolean(project.id))
    }
  )

  const count = computed(() => projects.value.length)
  const pending = computed(
    () => rootSource.value?.value === undefined || overlaySource.value?.value === undefined
  )

  return {
    projects,
    count,
    pending,
  }
}
