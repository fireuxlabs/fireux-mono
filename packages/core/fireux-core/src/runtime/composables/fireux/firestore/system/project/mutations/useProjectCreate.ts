import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
  FireuxProjectDoc,
  FireuxProjectStatus,
  FireuxProjectType,
} from '../../../../../../models/system/project.model'
import { useRequireUser } from '../../../../firebase/useRequireUser'

const toSlug = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeString = (value: unknown) => String(value || '').trim()

export type ProjectCreateOptions = {
  collectionPath?: string
  test?: boolean
}

export type ProjectCreateInput = {
  name: string
  slug: string
  description?: string
  status?: FireuxProjectStatus
  project_type: FireuxProjectType
  source_url: string
  console_endpoint_url: string
  app_id: string
  ecosystem_id: string
  firebase_project_id: string
}

export function useProjectCreate(options: ProjectCreateOptions = {}) {
  const db = useFirestore()
  const collectionPath =
    options.test === true ? 'test-projects' : String(options.collectionPath || 'projects').trim() || 'projects'

  async function createProject(input: ProjectCreateInput): Promise<string> {
    const user = await useRequireUser()
    const name = normalizeString(input?.name)
    const slug = toSlug(normalizeString(input?.slug))
    const description = normalizeString(input?.description)
    const status = (normalizeString(input?.status) || 'active') as FireuxProjectStatus
    const projectType = normalizeString(input?.project_type) as FireuxProjectType | ''
    const sourceUrl = normalizeString(input?.source_url)
    const consoleEndpointUrl = normalizeString(input?.console_endpoint_url)
    const appId = normalizeString(input?.app_id)
    const ecosystemId = normalizeString(input?.ecosystem_id)
    const firebaseProjectId = normalizeString(input?.firebase_project_id)

    if (!name) {
      throw new Error('Project name is required')
    }

    if (!slug) {
      throw new Error('Project slug is required')
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

    const ref = doc(db, collectionPath, slug)
    const snap = await getDoc(ref)
    if (snap.exists()) return slug

    const payload: FireuxProjectDoc = {
      name,
      slug,
      description,
      status,
      project_type: projectType,
      source_url: sourceUrl,
      console_endpoint_url: consoleEndpointUrl,
      app_id: appId,
      ecosystem_id: ecosystemId,
      firebase_project_id: firebaseProjectId,
      owner_user_id: user.uid,
      created_at: serverTimestamp() as any,
      updated_at: serverTimestamp() as any,
    }

    await setDoc(ref, payload as any)
    return slug
  }

  return { createProject }
}
