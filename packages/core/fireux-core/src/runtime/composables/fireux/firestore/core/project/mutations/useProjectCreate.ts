import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
  AppProject,
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
} from '../../../system/console/mutations/useConsoleEnsure'
import { useConsoleEnsure } from '../../../system/console/mutations/useConsoleEnsure'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const resolveTestUserLabel = (displayName: unknown, uid: unknown) => {
  const resolvedDisplayName = normalizeString(displayName)
  if (resolvedDisplayName) return resolvedDisplayName

  const resolvedUid = normalizeString(uid)
  if (!resolvedUid) return 'User'

  return `User ${resolvedUid.slice(0, 6)}`
}

type ProjectTestCreateInput = {
  id?: string
  slug?: string
  name?: string
  subtitle?: string
  image_url?: string
}

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
      : normalizeString(options.collectionPath || 'projects') || 'projects'
  const isTestProjectCollection =
    options.test === true || collectionPath === 'test-projects'

  async function createTestProject(
    input: ProjectTestCreateInput = {}
  ): Promise<ConsoleRootEnsureResult> {
    const user = await useRequireUser()
    const id = normalizeString(input.id) || normalizeString(user.uid)
    const userLabel =
      normalizeString(input.subtitle) ||
      resolveTestUserLabel(user.displayName, user.uid)
    const name = normalizeString(input.name) || 'Test Project'
    const imageUrl = normalizeString(input.image_url)

    if (!id) {
      throw new Error('Test project id is required')
    }

    const ref = doc(db, 'test-projects', id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { id, created: false }
    }

    const slug = normalizeSlug(input.slug) || 'test-project'

    if (!slug) {
      throw new Error('Test project slug is required')
    }

    await setDocument<Partial<Project>>(
      'test-projects',
      id,
      {
        name,
        slug,
        description: userLabel,
        image_url: imageUrl,
        operator_ids: [id],
      },
      {
        creator: true,
      }
    )

    return { id, created: true }
  }

  async function runProjectCreate(
    input: ProjectCreateInput,
    ensureOptions: EnsureProjectOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<ConsoleEnsureResult> {
    const user = await useRequireUser()
    const requestedRootId = normalizeString(ensureOptions.existingRootId || input?.id)

    const ensureRoot = async (): Promise<ConsoleRootEnsureResult> => {
      const id = requestedRootId
      const requestedName = normalizeString(input?.name)
      const defaultTestName = isTestProjectCollection
        ? `${resolveTestUserLabel(user.displayName, user.uid)} Test Project`
        : ''
      const name =
        isTestProjectCollection && (!requestedName || requestedName === user.uid)
          ? defaultTestName
          : requestedName
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

      const payload: Partial<Omit<Project, 'id' | 'created' | 'updated'>> = {
        app_scope_state: 'root_only',
        app_scope_app_id: '',
        name,
        slug,
        status,
        project_type: projectType,
        source_url: sourceUrl,
        console_endpoint_url: consoleEndpointUrl,
        app_id: appId,
        ecosystem_id: ecosystemId,
        firebase_project_id: firebaseProjectId,
        owner_user_id: user.uid,
        operator_ids: [user.uid],
        team_ids: [user.uid],
      }

      if (description) {
        payload.description = description
      }

      if (imageUrl) {
        payload.image_url = imageUrl
      }

      if (primaryProject) {
        payload.primary_project = true
      }

      await setDocument(collectionPath, id, payload, {
        creator: true,
      })

      return { id, created: true }
    }

    return ensureConsole<AppProject>({
      type: 'project',
      mode: ensureOptions.mode ?? defaultMode,
      ensureRoot,
      createOverlay: async () =>
        ({
          operator_ids: [user.uid],
          team_ids: [user.uid],
        }) as AppProject,
    })
  }

  async function createProject(
    input: ProjectCreateInput,
    ensureOptions: EnsureProjectOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runProjectCreate(input, ensureOptions, 'public')
  }

  async function ensureProject(
    input: ProjectCreateInput,
    ensureOptions: EnsureProjectOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runProjectCreate(input, ensureOptions, 'console')
  }

  return { createProject, ensureProject, createTestProject }
}
