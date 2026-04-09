import { computed } from 'vue'
import { useProjectFetch } from '../../firestore/system/project/fetch/useProjectFetch'
import { useProjectSelection } from './useProjectSelection'

/**
 * Live project loader.
 * Loads the selected project document from `projects/<id>`.
 */
export function useActiveProject() {
  const { selectedId: id } = useProjectSelection()
  const { project: fetchProject, pending } = useProjectFetch()
  const liveProject = fetchProject(id)
  const project = computed(() => {
    if (!id.value) return null
    return liveProject.value ?? null
  })

  return {
    id,
    project,
    pending,
  }
}
