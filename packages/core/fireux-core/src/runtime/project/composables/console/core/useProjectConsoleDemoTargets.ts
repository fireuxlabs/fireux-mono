import type { MaybeRefOrGetter } from 'vue'
import { useConsoleDemoData } from '../../../../composables/fireux/console/useConsoleDemoData'
import {
  useProjectInterface,
  type ProjectSurface,
} from '../../useProjectInterface'

export type ProjectConsoleDemoTargets = {
  projects: ProjectSurface[]
}

export function useProjectConsoleDemoTargets(
  active: MaybeRefOrGetter<boolean>
) {
  const { surface } = useProjectInterface()

  return useConsoleDemoData<ProjectConsoleDemoTargets>({
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
