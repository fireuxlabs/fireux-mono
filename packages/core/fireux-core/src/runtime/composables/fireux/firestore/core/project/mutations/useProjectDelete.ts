import { useFirestoreDelete } from '../../../operations/useFirestoreDelete'
import { ProjectStorage } from '../../../../../../models/system/project.model'

const clean = (value: unknown) => String(value ?? '').trim()

export function useProjectDelete() {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteProject(projectId: string) {
    const id = clean(projectId)
    if (!id) throw new Error('Project id is required')

    await deleteDocument(ProjectStorage.rootCollection, id)
  }

  return {
    deleteProject,
  }
}
