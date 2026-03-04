import { graniteDemoCoreScenario } from './granite-demo-core'
import { lakesideStabilityScenario } from './lakeside-stability'
import { citylineMomentumScenario } from './cityline-momentum'
import { rivergateRecoveryScenario } from './rivergate-recovery'
import type {
  ReadOnlyPortfolioScenario,
  ReadOnlyPortfolioScenarioListItem,
} from './_shared/types'

export type {
  ReadOnlyComplianceRecord,
  ReadOnlyDocument,
  ReadOnlyDocumentLink,
  ReadOnlyFinancialSignals,
  ReadOnlyFinancialTransaction,
  ReadOnlyLease,
  ReadOnlyMaintenanceTicket,
  ReadOnlyTask,
  ReadOnlyTenant,
  ReadOnlyPortfolioScenario,
  ReadOnlyPortfolioScenarioListItem,
} from './_shared/types'

export type ScenarioKey =
  | 'granite-demo-core'
  | 'lakeside-stability'
  | 'cityline-momentum'
  | 'rivergate-recovery'

export const scenarioKeys: ScenarioKey[] = [
  'granite-demo-core',
  'lakeside-stability',
  'cityline-momentum',
  'rivergate-recovery',
]

const scenarioBuilders: Record<ScenarioKey, () => ReadOnlyPortfolioScenario> = {
  'granite-demo-core': graniteDemoCoreScenario,
  'lakeside-stability': lakesideStabilityScenario,
  'cityline-momentum': citylineMomentumScenario,
  'rivergate-recovery': rivergateRecoveryScenario,
}

const normalize = (value: unknown) => String(value || '').trim()

const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const SCENARIOS_BY_KEY = new Map<ScenarioKey, ReadOnlyPortfolioScenario>(
  scenarioKeys.map((scenarioKey) => [scenarioKey, scenarioBuilders[scenarioKey]()])
)

const toScenarioListItem = (
  scenario: ReadOnlyPortfolioScenario
): ReadOnlyPortfolioScenarioListItem => ({
  id: scenario.id,
  name: scenario.name || scenario.portfolio.name,
  label: scenario.label || scenario.portfolio.region_label || 'Read-only demo',
  image_url: normalize(scenario.manager.avatar_url),
  manager_display_name: normalize(scenario.manager.display_name),
  manager_avatar_url: normalize(scenario.manager.avatar_url),
  mode: 'read-only',
  property_count: Array.isArray(scenario.properties) ? scenario.properties.length : 0,
  unit_count: Array.isArray(scenario.units) ? scenario.units.length : 0,
  task_count: Array.isArray(scenario.tasks) ? scenario.tasks.length : 0,
})

export const getReadOnlyPortfolioScenario = (
  portfolioId?: string
): ReadOnlyPortfolioScenario | null => {
  const candidate = normalize(portfolioId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return SCENARIOS_BY_KEY.get(candidate) ?? null
}

export const getReadOnlyPortfolioScenarioList = (): ReadOnlyPortfolioScenarioListItem[] =>
  scenarioKeys
    .map((scenarioKey) => SCENARIOS_BY_KEY.get(scenarioKey))
    .filter((scenario): scenario is ReadOnlyPortfolioScenario => Boolean(scenario))
    .map((scenario) => toScenarioListItem(scenario))
