import { useAsyncData } from '#imports'
import {
  useAppInterface,
  type AppCard,
} from 'fireux-core/runtime/app/composables/useAppInterface'
import {
  useEcosystemInterface,
  type EcosystemInterfaceCard,
} from 'fireux-core/runtime/ecosystem/composables/useEcosystemInterface'
import {
  useProjectInterface,
  type ProjectInterfaceCard,
} from 'fireux-core/runtime/project/composables/useProjectInterface'

const productDemoSurface = 'project-workspace' as const
const productDemoDataSource = 'demo' as const

export type FireuxProductDemo = {
  surface: 'project-workspace'
  dataSource: 'demo'
  workspace: {
    projectId: string
    projectPill: ProjectInterfaceCard
    apps: AppCard[]
    ecosystems: EcosystemInterfaceCard[]
  }
}

export function useFireuxProductDemo() {
  const {
    surface: projectSurface,
    pill: projectPill,
  } = useProjectInterface()
  const { cell: appCell } = useAppInterface()
  const { cell: ecosystemCell } = useEcosystemInterface()

  return useAsyncData<FireuxProductDemo>(
    'fireux-product-demo-project-workspace-v1',
    async () => {
      const { projectDemoScenarios } = await import(
        'fireux-core/runtime/project/demo/scenarios'
      )
      const fireuxScenarios = projectDemoScenarios.filter(
        scenario => scenario.appId === 'fireux-app'
      )
      const scenario = fireuxScenarios[0]

      if (!scenario || fireuxScenarios.length !== 1) {
        throw new Error(
          'FireUX Product Demo requires one FireUX-owned Project scenario.'
        )
      }

      const project = projectSurface({ project: scenario.project })
      const projectedProjectPill = projectPill(project)
      const apps = scenario.apps
        .map(app => appCell(app))
        .filter((card): card is AppCard => Boolean(card))
      const ecosystems = scenario.ecosystems
        .map(ecosystem =>
          ecosystemCell({
            ...ecosystem,
            appCount: scenario.apps.filter(
              app => app.ecosystem_id === ecosystem.id
            ).length,
          })
        )
        .filter(
          (card): card is EcosystemInterfaceCard => Boolean(card)
        )

      if (
        !project
        || !projectedProjectPill
        || apps.length !== scenario.apps.length
        || ecosystems.length !== scenario.ecosystems.length
      ) {
        throw new Error(
          'FireUX Product Demo Project projection is incomplete.'
        )
      }

      return {
        surface: productDemoSurface,
        dataSource: productDemoDataSource,
        workspace: {
          projectId: project.id,
          projectPill: projectedProjectPill,
          apps,
          ecosystems,
        },
      }
    },
    { deep: false }
  )
}
