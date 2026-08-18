import type { MaybeRefOrGetter } from 'vue'
import { useConsoleDemoData } from '../../../../composables/fireux/console/useConsoleDemoData'
import type { App } from '../../../../app/models/app.model.ts'
import type { Ecosystem } from '../../../../ecosystem/models/ecosystem.model.ts'
import {
  useProjectInterface,
  type ProjectSurface,
} from '../../useProjectInterface'

export type ProjectConsoleDemoScenario = {
  project: ProjectSurface
  apps: App[]
  ecosystems: Ecosystem[]
}
export type ProjectConsoleDemoData = {
  projects: ProjectSurface[]
  scenarios: ProjectConsoleDemoScenario[]
}

export function useProjectConsoleDemoData(active: MaybeRefOrGetter<boolean>) {
  const { surface } = useProjectInterface()
  return useConsoleDemoData<ProjectConsoleDemoData>({
    active,
    loader: async () => {
      const { projectDemoScenarios } = await import(
        '../../../demo/scenarios'
      )
      const scenarios = projectDemoScenarios.flatMap((scenario) => {
        const project = surface({ project: scenario.project })
        return project
          ? [
              {
                project,
                apps: scenario.apps.map((value) => ({ ...value })),
                ecosystems: scenario.ecosystems.map((value) => ({ ...value })),
              },
            ]
          : []
      })
      return { projects: scenarios.map((value) => value.project), scenarios }
    },
    isEmpty: (value) => value.projects.length === 0,
  })
}

export function findProjectConsoleDemoScenario(
  data: ProjectConsoleDemoData | undefined,
  projectId: string
) {
  return data?.scenarios.find((value) => value.project.id === projectId) ?? null
}
