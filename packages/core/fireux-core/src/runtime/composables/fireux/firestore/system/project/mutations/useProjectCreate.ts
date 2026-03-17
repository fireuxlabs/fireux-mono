import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
    Project,
    ProjectStatus,
    ProjectType,
} from '../../../../../../models/system/project.model'
import { normalizeSlug } from '../../../../../../utils/slug/normalizeSlug'
import { validateSlugFormat } from '../../../../../../utils/slug/validateSlugFormat'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

const normalizeString = (value: unknown) => String(value || '').trim()

export type ProjectCreateOptions = {
  collectionPath?: string
  test?: boolean
}

export type ProjectCreateInput = {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  primary_project?: boolean
  status?: ProjectStatus
  project_type: ProjectType
  source_url: string
  console_endpoint_url: string
  app_id: string
  ecosystem_id: string
  firebase_project_id: string
}

export function useProjectCreate(options: ProjectCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const collectionPath =
    options.test === true
      ? 'test-projects'
      : String(options.collectionPath || 'projects').trim() || 'projects'

  async function createProject(input: ProjectCreateInput): Promise<{ id: string }> {
    const user = await useRequireUser()

    const id = normalizeString(input?.id)
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
    if (snap.exists()) return { id }

    const payload: Omit<Project, 'id' | 'created' | 'updated'> = {
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

    return { id }
  }

  return { createProject }
}