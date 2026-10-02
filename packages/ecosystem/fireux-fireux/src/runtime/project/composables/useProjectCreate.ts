import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { Project } from '../models/project.model'

export function useProjectCreate() {
  const { createDocument } = useFirestoreCreate()

  async function createProject(input: Omit<Project, 'created' | 'updated'>) {
    const id = String(input.id || '').trim()
    return createDocument('projects', input, {
      ...(id ? { id } : {}),
      creator: true,
      app: true,
    })
  }

  return { createProject }
}
