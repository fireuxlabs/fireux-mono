import { computed, isRef, type Ref } from 'vue'
import { useProjectCollection } from './fetch/useProjectCollection'
import { useProjectFetch } from './fetch/useProjectFetch'
import { useProjectComputed } from './utils/view/useProjectComputed'
import { useProjectInterface } from './utils/view/useProjectInterface'

export type { Project } from '../../../../../models/system/project.model'
export type {
  ProjectCollectionFilter,
} from './fetch/useProjectCollection'

export {
  useProjectCollection,
}

export function useProject(id: string | Ref<string>) {
  const projectId = computed(() => {
    return isRef(id) ? String(id.value || '').trim() : String(id || '').trim()
  })

  const { project, pending } = useProjectFetch(projectId)

  return {
    project,
    pending,
    ...useProjectComputed(project),
    ...useProjectInterface(),
  }
}
