import type { MaybeRefOrGetter } from 'vue'
import { useWorkspaceDemoData } from '../../../../composables/fireux/workspace/useWorkspaceDemoData'
import type { App } from '../../../../app/models/app.model.ts'
import type { Ecosystem } from '../../../../ecosystem/models/ecosystem.model.ts'
import {
  useProjectInterface,
  type ProjectSurface,
} from '../../useProjectInterface'

export type ProjectWorkspaceDemoScenario = {
  project: ProjectSurface
  apps: App[]
  ecosystems: Ecosystem[]
}
export type ProjectWorkspaceDemoData = {
  projects: ProjectSurface[]
  scenarios: ProjectWorkspaceDemoScenario[]
}

export function useProjectWorkspaceDemoData(active: MaybeRefOrGetter<boolean>) {
  const { surface } = useProjectInterface()
  return useWorkspaceDemoData<ProjectWorkspaceDemoData>({
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

export function findProjectWorkspaceDemoScenario(
  data: ProjectWorkspaceDemoData | undefined,
  projectId: string
) {
  return data?.scenarios.find((value) => value.project.id === projectId) ?? null
}
