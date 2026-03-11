import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type {
  FireuxProjectDoc,
  FireuxProjectStatus,
} from '../../../../../../models/system/project.model'
import { useRequireUser } from '../../../../firebase/useRequireUser'

const toSlug = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export type ProjectCreateOptions = {
  collectionPath?: string
  test?: boolean
}

export type ProjectCreateInput = {
  name: string
  slug?: string
  description?: string
  status?: FireuxProjectStatus
}

export function useProjectCreate(options: ProjectCreateOptions = {}) {
  const db = useFirestore()
  const collectionPath =
    options.test === true ? 'test-projects' : String(options.collectionPath || 'projects').trim() || 'projects'

  async function createProject(input: ProjectCreateInput): Promise<string> {
    const user = await useRequireUser()
    const name = String(input?.name || '').trim()
    const slug = toSlug(String(input?.slug || '').trim() || name)
    const description = String(input?.description || '').trim()
    const status = (String(input?.status || 'active').trim() || 'active') as FireuxProjectStatus

    if (!name) {
      throw new Error('Project name is required')
    }

    if (!slug) {
      throw new Error('Project slug is required')
    }

    const ref = doc(db, collectionPath, slug)
    const snap = await getDoc(ref)
    if (snap.exists()) return slug

    const payload: FireuxProjectDoc = {
      name,
      slug,
      description,
      status,
      owner_user_id: user.uid,
      created_at: serverTimestamp() as any,
      updated_at: serverTimestamp() as any,
    }

    await setDoc(ref, payload as any)
    return slug
  }

  return { createProject }
}
