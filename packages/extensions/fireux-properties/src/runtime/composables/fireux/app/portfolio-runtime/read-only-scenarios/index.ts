import { createReadOnlyScenarioRegistry } from 'fireux-core/runtime/composables/fireux/runtime/createReadOnlyScenarioRegistry'
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

export const scenarioKeys = [
  'granite-demo-core',
  'lakeside-stability',
  'cityline-momentum',
  'rivergate-recovery',
 ] as const satisfies readonly ScenarioKey[]

const defaultScenarioKey: ScenarioKey = 'granite-demo-core'
const scenarioBuilders: Record<ScenarioKey, () => ReadOnlyPortfolioScenario> = {
  'granite-demo-core': graniteDemoCoreScenario,
  'lakeside-stability': lakesideStabilityScenario,
  'cityline-momentum': citylineMomentumScenario,
  'rivergate-recovery': rivergateRecoveryScenario,
}

const normalize = (value: unknown) => String(value || '').trim()

const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const registry = createReadOnlyScenarioRegistry<
  ReadOnlyPortfolioScenario,
  ScenarioKey,
  ReadOnlyPortfolioScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: scenarioBuilders,
  toListItem: (scenario) => ({
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
  }),
})

export const getReadOnlyPortfolioScenario = (
  portfolioId?: string
): ReadOnlyPortfolioScenario | null => {
  const candidate = normalize(portfolioId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return registry.get(candidate)
}

export const getDefaultReadOnlyPortfolioScenario = (): ReadOnlyPortfolioScenario =>
  registry.resolve(defaultScenarioKey)

export const getReadOnlyPortfolioScenarioList = (): ReadOnlyPortfolioScenarioListItem[] =>
  registry.getList()

export const getReadOnlyPortfolioScenarios = (): ReadOnlyPortfolioScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))
