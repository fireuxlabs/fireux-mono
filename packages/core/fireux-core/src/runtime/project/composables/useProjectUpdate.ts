import { unref, type MaybeRef } from 'vue'
import { useFirestoreUpdate } from '../../composables/fireux/firestore/operations/useFirestoreUpdate'
import type { Project } from '../models/project.model'

export function useProjectUpdate(id: MaybeRef<string | null | undefined>) {
  const { updateDocument } = useFirestoreUpdate()

  async function updateProject(changes: Partial<Omit<Project, 'id'>>) {
    await updateDocument<Project>(
      'projects',
      String(unref(id) || '').trim(),
      changes
    )
  }

  return { updateProject }
}
