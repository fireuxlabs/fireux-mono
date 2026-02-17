import type { ReadOnlyKitchenScenario } from './types'
import { scenarioBrothBloom } from './scenarios/broth-bloom'
import { scenarioStackSizzle } from './scenarios/stack-sizzle'
import { scenarioTakumiRamen } from './scenarios/takumi-ramen'

export type ScenarioKey = 'stack-sizzle' | 'takumi-ramen' | 'broth-bloom'

const defaultScenarioKey: ScenarioKey = 'stack-sizzle'
const normalize = (value: unknown) => String(value || '').trim()

const SCENARIOS: ReadOnlyKitchenScenario[] = [
  scenarioStackSizzle,
  scenarioTakumiRamen,
  scenarioBrothBloom,
]

const SCENARIOS_BY_KEY = new Map<ScenarioKey, ReadOnlyKitchenScenario>(
  SCENARIOS.map((scenario) => [
    normalize(scenario.meta.id) as ScenarioKey,
    scenario,
  ])
)

export const scenarioKeys: ScenarioKey[] = [
  'stack-sizzle',
  'takumi-ramen',
  'broth-bloom',
]

const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const fallbackScenario = (kitchenId: string): ReadOnlyKitchenScenario => ({
  meta: {
    id: kitchenId || defaultScenarioKey,
    name: 'Unknown kitchen',
    address_label: '',
    image_url: '',
    mode: 'read-only',
  },
  kitchen: {
    id: kitchenId || defaultScenarioKey,
    name: 'Unknown kitchen',
  } as any,
  globalIngredients: [],
  kitchenIngredients: [],
  teamMembers: [],
  competencyGroups: [],
  stacks: {
    menu: {
      ingredientIds: {},
      stations: [],
      menus: [],
      dishes: [],
      recipes: [],
      miseTasks: [],
    },
    procurement: {
      suppliers: [],
      supplierIngredients: [],
      purchases: [],
    },
    service: {
      incomingOrders: [],
    },
    training: {
      modules: [],
    },
    haccp: {
      checks: [],
    },
  },
})

export const resolveReadOnlyScenarioKey = (kitchenId?: string): ScenarioKey => {
  const id = normalize(kitchenId)
  if (!id) return defaultScenarioKey
  return isScenarioKey(id) ? id : defaultScenarioKey
}

export const getReadOnlyKitchenScenario = (
  kitchenId?: string
): ReadOnlyKitchenScenario => {
  const scenarioKey = resolveReadOnlyScenarioKey(kitchenId)
  const scenario = SCENARIOS_BY_KEY.get(scenarioKey)
  return scenario ?? fallbackScenario(normalize(kitchenId))
}

export const getDefaultReadOnlyKitchenScenario = (): ReadOnlyKitchenScenario =>
  getReadOnlyKitchenScenario(defaultScenarioKey)

export const getReadOnlyKitchenScenarioList = () =>
  scenarioKeys.map((scenarioKey) => getReadOnlyKitchenScenario(scenarioKey).meta)

