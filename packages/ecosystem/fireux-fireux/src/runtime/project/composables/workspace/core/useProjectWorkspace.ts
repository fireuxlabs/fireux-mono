import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useProjectCreate } from '../../useProjectCreate'
import { useProjectDelete } from '../../useProjectDelete'
import { useProjectRead } from '../../useProjectRead'
import { useProjectUpdate } from '../../useProjectUpdate'

export function useProjectWorkspace() {
  const { selectedId: id } = useWorkspace('project')
  const creation = useProjectCreate()
  const update = useProjectUpdate(id)
  const removal = useProjectDelete(id)
  const { data, outcome } = useProjectRead(id)

  return {
    data,
    id,
    outcome,
    crud: { create: creation.createProject, update: update.updateProject, delete: removal.deleteProject },
  }
}
