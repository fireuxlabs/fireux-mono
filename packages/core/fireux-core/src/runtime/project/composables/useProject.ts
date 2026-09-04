import { useProjectRead } from './useProjectRead'
import { useProjectCreate } from './useProjectCreate'
import { useProjectUpdate } from './useProjectUpdate'
import { useProjectDelete } from './useProjectDelete'
import type { MaybeRef } from 'vue'

/** Canonical root Project entity entrance. */
export function useProject(id: MaybeRef<string | null | undefined>) {
  const read = useProjectRead(id)
  const { createProject } = useProjectCreate()
  const { updateProject } = useProjectUpdate(id)
  const { deleteProject } = useProjectDelete(id)

  return {
    data: read.data,
    outcome: read.outcome,
    pending: read.pending,
    error: read.error,
    create: createProject,
    update: updateProject,
    delete: deleteProject,
  }
}
