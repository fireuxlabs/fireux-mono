import { createReadOnlyScenarioRegistry } from 'fireux-core/runtime/composables/fireux/runtime/createReadOnlyScenarioRegistry'
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

export const scenarioKeys = [
  'stack-sizzle',
  'takumi-ramen',
  'broth-bloom',
] as const satisfies readonly ScenarioKey[]

const defaultScenarioKey: ScenarioKey = 'stack-sizzle'
const scenarioBuilders: Record<ScenarioKey, () => ReadOnlyKitchenScenario> = {
  'stack-sizzle': stackSizzleScenario,
  'takumi-ramen': takumiRamenScenario,
  'broth-bloom': brothBloomScenario,
}
const normalize = (value: unknown) => String(value || '').trim()

const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const registry = createReadOnlyScenarioRegistry<
  ReadOnlyKitchenScenario,
  ScenarioKey,
  ReadOnlyKitchenScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: scenarioBuilders,
  toListItem: (scenario, fallbackKey) => {
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
  },
})

export const resolveScenario = (key: ScenarioKey): ReadOnlyKitchenScenario =>
  registry.resolve(key)

export const defaultScenario = (): ReadOnlyKitchenScenario =>
  registry.resolve(defaultScenarioKey)

export const resolveReadOnlyScenarioKey = (kitchenId?: string): ScenarioKey | null => {
  const id = normalize(kitchenId)
  if (!id) return null
  return isScenarioKey(id) ? id : null
}

export const getReadOnlyKitchenScenario = (
  kitchenId?: string
): ReadOnlyKitchenScenario | null => {
  const scenarioKey = resolveReadOnlyScenarioKey(kitchenId)
  if (!scenarioKey) return null
  return registry.get(scenarioKey)
}

export const getDefaultReadOnlyKitchenScenario = (): ReadOnlyKitchenScenario =>
  registry.resolve(defaultScenarioKey)

export const getReadOnlyKitchenScenarios = (): ReadOnlyKitchenScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))

export const getReadOnlyKitchenScenarioList = () =>
  registry.getList()
