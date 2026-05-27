import { useRuntimeConfig } from '#imports'
import { computed, isRef, type Ref } from 'vue'
import { useProjectFetch } from './fetch/useProjectFetch'
import { useProjectBootstrapCreate } from './mutations/useProjectBootstrapCreate'
import { useProjectCreate } from './mutations/useProjectCreate'
import { useProjectInterface } from './utils/view/useProjectInterface'

export type { Project } from '../../../../../models/system/project.model'

export function useProject(id?: string | Ref<string>) {
  const runtime = useRuntimeConfig()

  const projectId = computed(() => {
    if (id === undefined) {
      return String(runtime.public?.firebaseEcosystem?.firebase?.projectId || '').trim()
    }

    return isRef(id) ? String(id.value || '').trim() : String(id || '').trim()
  })

  const { project, pending } = useProjectFetch(projectId)

  return {
    project,
    pending,
    ...useProjectInterface(),
    ...useProjectBootstrapCreate(),
    ...useProjectCreate(),
  }
}
