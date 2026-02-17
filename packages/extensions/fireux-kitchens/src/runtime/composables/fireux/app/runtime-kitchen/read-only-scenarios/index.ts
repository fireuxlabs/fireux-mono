import type { DummyScenario } from './_shared/types'
import { brothBloomScenario } from './broth-bloom'
import { stackSizzleScenario } from './stack-sizzle'
import { takumiRamenScenario } from './takumi-ramen'

export type ScenarioKey = 'stack-sizzle' | 'takumi-ramen' | 'broth-bloom'
export type ReadOnlyKitchenScenario = DummyScenario
export type ReadOnlyKitchenScenarioListItem = {
  id: string
  name: string
  address_label: string
  image_url: string
  mode: 'read-only'
}

export const scenarioKeys: ScenarioKey[] = ['stack-sizzle', 'takumi-ramen', 'broth-bloom']

const scenarioBuilders: Record<ScenarioKey, () => ReadOnlyKitchenScenario> = {
  'stack-sizzle': stackSizzleScenario,
  'takumi-ramen': takumiRamenScenario,
  'broth-bloom': brothBloomScenario,
}

export const resolveScenario = (key: ScenarioKey): ReadOnlyKitchenScenario =>
  scenarioBuilders[key]()

export const defaultScenario = (): ReadOnlyKitchenScenario =>
  scenarioBuilders['stack-sizzle']()

const defaultScenarioKey: ScenarioKey = 'stack-sizzle'
const normalize = (value: unknown) => String(value || '').trim()

const SCENARIOS_BY_KEY = new Map<ScenarioKey, ReadOnlyKitchenScenario>(
  scenarioKeys.map((scenarioKey) => [scenarioKey, resolveScenario(scenarioKey)])
)

const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

export const resolveReadOnlyScenarioKey = (kitchenId?: string): ScenarioKey => {
  const id = normalize(kitchenId)
  if (!id) return defaultScenarioKey
  return isScenarioKey(id) ? id : defaultScenarioKey
}

export const getReadOnlyKitchenScenario = (kitchenId?: string): ReadOnlyKitchenScenario => {
  const scenarioKey = resolveReadOnlyScenarioKey(kitchenId)
  const scenario = SCENARIOS_BY_KEY.get(scenarioKey)
  if (scenario) return scenario

  const defaultResolvedScenario = SCENARIOS_BY_KEY.get(defaultScenarioKey)
  if (defaultResolvedScenario) return defaultResolvedScenario

  throw new Error(
    `[read-only-scenarios] Missing default scenario "${defaultScenarioKey}".`
  )
}

export const getDefaultReadOnlyKitchenScenario = (): ReadOnlyKitchenScenario =>
  getReadOnlyKitchenScenario(defaultScenarioKey)

const toScenarioListItem = (
  scenario: ReadOnlyKitchenScenario,
  fallbackKey: ScenarioKey
): ReadOnlyKitchenScenarioListItem => {
  const kitchen = (scenario.kitchen ?? {}) as Record<string, unknown>
  const id = normalize(kitchen.id) || fallbackKey
  const name = normalize(kitchen.name) || id
  const addressLabel = normalize(kitchen.short_address) || normalize(kitchen.formatted_address)
  const imageUrl = normalize(kitchen.image_url)

  return {
    id,
    name,
    address_label: addressLabel,
    image_url: imageUrl,
    mode: 'read-only',
  }
}

export const getReadOnlyKitchenScenarioList = () =>
  scenarioKeys.map((scenarioKey) =>
    toScenarioListItem(getReadOnlyKitchenScenario(scenarioKey), scenarioKey)
  )
