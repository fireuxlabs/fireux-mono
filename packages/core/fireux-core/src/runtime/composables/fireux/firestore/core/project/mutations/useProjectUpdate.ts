import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import {
  ProjectStorage,
  type Project,
  type ProjectUpdateInput,
} from '../../../../../../models/system/project.model'

const clean = (value: unknown) => String(value ?? '').trim()

export function useProjectUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateProject(projectId: string, patch: ProjectUpdateInput) {
    const id = clean(projectId)
    if (!id) throw new Error('Project id is required')

    await updateDocument<Project>(ProjectStorage.collection, id, patch)
  }

  return {
    updateProject,
  }
}
