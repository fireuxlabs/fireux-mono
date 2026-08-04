import type { MaybeRefOrGetter } from 'vue'
import { useConsoleDemoData } from '../../../app/console/useConsoleDemoData'
import type { App } from '../../../../../models/core/app.model'
import type { Ecosystem } from '../../../../../models/core/ecosystem.model'
import {
  useProjectInterface,
  type ProjectSurface,
} from '../../../firestore/core/project/utils/view/useProjectInterface'

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
        '../../../../../demo/project/scenarios'
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
