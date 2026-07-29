import { useAsyncData } from '#imports'
import {
  useAppInterface,
  type AppCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import {
  useEcosystemInterface,
  type EcosystemInterfaceCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import {
  useProjectInterface,
  type ProjectInterfaceCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const productDemoSurface = 'project-console' as const
const productDemoDataSource = 'demo' as const

export type FireuxProductDemo = {
  surface: 'project-console'
  dataSource: 'demo'
  console: {
    projectId: string
    projectPill: ProjectInterfaceCard
    apps: AppCard.Card[]
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
    'fireux-product-demo-project-console-v1',
    async () => {
      const { projectDemoScenarios } = await import(
        'fireux-core/runtime/demo/project/scenarios'
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
        .filter((card): card is AppCard.Card => Boolean(card))
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
        console: {
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
