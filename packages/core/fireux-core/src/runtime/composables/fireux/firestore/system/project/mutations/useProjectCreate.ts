import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
    ProjectApp,
    ProjectCore,
    Project,
    ProjectCreateInput,
    ProjectStatus,
    ProjectType,
} from '../../../../../../models/system/project.model'
import { normalizeSlug } from '../../../../../../utils/slug/normalizeSlug'
import { validateSlugFormat } from '../../../../../../utils/slug/validateSlugFormat'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from '../../console/mutations/useConsoleEnsure'
import { useConsoleEnsure } from '../../console/mutations/useConsoleEnsure'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

const normalizeString = (value: unknown) => String(value || '').trim()

export type ProjectCreateOptions = {
  collectionPath?: string
  test?: boolean
}

export type EnsureProjectOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

export function useProjectCreate(options: ProjectCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureConsole } = useConsoleEnsure()
  const collectionPath =
    options.test === true
      ? 'test-projects'
      : String(options.collectionPath || 'projects').trim() || 'projects'

  async function createProject(
    input: ProjectCreateInput,
    ensureOptions: EnsureProjectOptions = {}
  ): Promise<ConsoleEnsureResult> {
    const user = await useRequireUser()
    const requestedRootId = normalizeString(ensureOptions.existingRootId || input?.id)

    const ensureRoot = async (): Promise<ConsoleRootEnsureResult> => {
      const id = requestedRootId
      const name = normalizeString(input?.name)
      const slug = normalizeSlug(input?.slug)
      const description = normalizeString(input?.description)
      const imageUrl = normalizeString(input?.image_url)
      const primaryProject = Boolean(input?.primary_project)
      const status = (normalizeString(input?.status) || 'active') as ProjectStatus
      const projectType = normalizeString(input?.project_type) as ProjectType | ''
      const sourceUrl = normalizeString(input?.source_url)
      const consoleEndpointUrl = normalizeString(input?.console_endpoint_url)
      const appId = normalizeString(input?.app_id)
      const ecosystemId = normalizeString(input?.ecosystem_id)
      const firebaseProjectId = normalizeString(input?.firebase_project_id)
      const slugFormat = validateSlugFormat(slug, {
        required: true,
        minLength: 3,
        maxLength: 80,
        label: 'Project slug',
      })

      if (!id) {
        throw new Error('Project id is required')
      }

      if (!name) {
        throw new Error('Project name is required')
      }

      if (!slugFormat.isValid) {
        throw new Error(slugFormat.message || 'Invalid project slug')
      }

      if (!projectType) {
        throw new Error('Project type is required')
      }

      if (!sourceUrl) {
        throw new Error('Project source URL is required')
      }

      if (!consoleEndpointUrl) {
        throw new Error('Project console endpoint URL is required')
      }

      if (!appId) {
        throw new Error('Project app id is required')
      }

      if (!ecosystemId) {
        throw new Error('Project ecosystem id is required')
      }

      if (!firebaseProjectId) {
        throw new Error('Project Firebase project id is required')
      }

      const ref = doc(db, collectionPath, id)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        return { id, created: false }
      }

      const payload: Omit<ProjectCore, 'id' | 'created' | 'updated'> = {
        name,
        slug,
        description,
        image_url: imageUrl,
        status,
        primary_project: primaryProject,
        project_type: projectType,
        source_url: sourceUrl,
        console_endpoint_url: consoleEndpointUrl,
        app_id: appId,
        ecosystem_id: ecosystemId,
        firebase_project_id: firebaseProjectId,
        owner_user_id: user.uid,
      }

      await setDocument(collectionPath, id, payload, {
        creator: true,
      })

      return { id, created: true }
    }

    return ensureConsole<ProjectApp>({
      type: 'project',
      mode: ensureOptions.mode ?? 'console',
      existingRootId: requestedRootId || undefined,
      ensureRoot,
      createOverlay: async () =>
        ({
          admin_ids: [user.uid],
          join_requests: [] as string[],
          console_enabled: true,
        }) as ProjectApp,
    })
  }

  return { createProject }
}
