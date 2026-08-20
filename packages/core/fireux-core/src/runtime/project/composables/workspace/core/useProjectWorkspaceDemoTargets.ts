import type { MaybeRefOrGetter } from 'vue'
import { useWorkspaceDemoData } from '../../../../composables/fireux/workspace/useWorkspaceDemoData'
import {
  useProjectInterface,
  type ProjectSurface,
} from '../../useProjectInterface'

export type ProjectWorkspaceDemoTargets = {
  projects: ProjectSurface[]
}

export function useProjectWorkspaceDemoTargets(
  active: MaybeRefOrGetter<boolean>
) {
  const { surface } = useProjectInterface()

  return useWorkspaceDemoData<ProjectWorkspaceDemoTargets>({
    active,
    loader: async () => {
      const { projectDemoTargets } = await import(
        '../../../demo/targets'
      )
      const projects = projectDemoTargets.flatMap((project) => {
        const target = surface({ project })
        return target ? [target] : []
      })
      return { projects }
    },
    isEmpty: (value) => value.projects.length === 0,
  })
}
