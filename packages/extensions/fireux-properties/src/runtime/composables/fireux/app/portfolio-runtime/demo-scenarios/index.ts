import { createDemoScenarioRegistry } from 'fireux-core/runtime/composables/fireux/runtime/createDemoScenarioRegistry'
import { cedarLoopCoreScenario } from './cedar-loop-core'
import { lakesideStabilityScenario } from './lakeside-stability'
import { citylineMomentumScenario } from './cityline-momentum'
import { rivergateRecoveryScenario } from './rivergate-recovery'
import type { DemoPortfolioScenario, DemoPortfolioScenarioListItem } from './_shared/types'

export type {
  DemoComplianceRecord,
  DemoDocument,
  DemoDocumentLink,
  DemoFinancialSignals,
  DemoFinancialTransaction,
  DemoLease,
  DemoMaintenanceTicket,
  DemoTask,
  DemoTenant,
  DemoPortfolioManager,
} from './_shared/types'

export type ScenarioKey =
  | 'cedar-loop-core'
  | 'lakeside-stability'
  | 'cityline-momentum'
  | 'rivergate-recovery'

export const scenarioKeys = [
  'cedar-loop-core',
  'lakeside-stability',
  'cityline-momentum',
  'rivergate-recovery',
 ] as const satisfies readonly ScenarioKey[]

const defaultScenarioKey: ScenarioKey = 'cedar-loop-core'
const scenarioBuilders: Record<ScenarioKey, () => DemoPortfolioScenario> = {
  'cedar-loop-core': cedarLoopCoreScenario,
  'lakeside-stability': lakesideStabilityScenario,
  'cityline-momentum': citylineMomentumScenario,
  'rivergate-recovery': rivergateRecoveryScenario,
}

const normalize = (value: unknown) => String(value || '').trim()

const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const registry = createDemoScenarioRegistry<
  DemoPortfolioScenario,
  ScenarioKey,
  DemoPortfolioScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: scenarioBuilders,
  toListItem: (scenario) => ({
    id: scenario.id,
    name: scenario.name || scenario.portfolio.name,
    label: scenario.label || scenario.portfolio.region_label || 'Demo showcase',
    image_url: normalize(scenario.manager.avatar_url),
    manager_display_name: normalize(scenario.manager.display_name),
    manager_avatar_url: normalize(scenario.manager.avatar_url),
    mode: 'demo',
    property_count: Array.isArray(scenario.properties) ? scenario.properties.length : 0,
    unit_count: Array.isArray(scenario.units) ? scenario.units.length : 0,
    task_count: Array.isArray(scenario.tasks) ? scenario.tasks.length : 0,
  }),
})

export const getDemoPortfolioScenario = (
  portfolioId?: string
): DemoPortfolioScenario | null => {
  const candidate = normalize(portfolioId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return registry.get(candidate)
}

export const getDefaultDemoPortfolioScenario = (): DemoPortfolioScenario =>
  registry.resolve(defaultScenarioKey)

export const getDemoPortfolioScenarioList = (): DemoPortfolioScenarioListItem[] =>
  registry.getList()

export const getDemoPortfolioScenarios = (): DemoPortfolioScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))
