import { createDemoScenarioRegistry } from 'fireux-core/runtime/composables/fireux/console/createDemoScenarioRegistry'
import type { DemoScenario } from './_shared/types'
import { brothBloomScenario } from './broth-bloom'
import { stackSizzleScenario } from './stack-sizzle'
import { takumiRamenScenario } from './takumi-ramen'

export type ScenarioKey = 'stack-sizzle' | 'takumi-ramen' | 'broth-bloom'
export type DemoKitchenScenario = DemoScenario
export type DemoKitchenScenarioListItem = {
  id: string
  name: string
  address_label: string
  image_url: string
  mode: 'demo'
}

export const scenarioKeys = [
  'stack-sizzle',
  'takumi-ramen',
  'broth-bloom',
] as const satisfies readonly ScenarioKey[]

const defaultScenarioKey: ScenarioKey = 'stack-sizzle'
const scenarioBuilders: Record<ScenarioKey, () => DemoKitchenScenario> = {
  'stack-sizzle': stackSizzleScenario,
  'takumi-ramen': takumiRamenScenario,
  'broth-bloom': brothBloomScenario,
}
const normalize = (value: unknown) => String(value || '').trim()
const registry = createDemoScenarioRegistry<
  DemoKitchenScenario,
  ScenarioKey,
  DemoKitchenScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: scenarioBuilders,
  toListItem: (scenario) => {
    const kitchen = (scenario.kitchen ?? {}) as Record<string, unknown>
    const id = normalize(kitchen.id) || scenario.id
    const name = normalize(kitchen.name) || id
    const addressLabel = normalize(kitchen.short_address) || normalize(kitchen.formatted_address)
    const imageUrl = normalize(kitchen.image_url)

    return {
      id,
      name,
      address_label: addressLabel,
      image_url: imageUrl,
      mode: 'demo',
    }
  },
})

export const resolveDemoKitchenScenario = (key: ScenarioKey): DemoKitchenScenario =>
  registry.resolve(key)

export const getDefaultDemoKitchenScenario = (): DemoKitchenScenario =>
  registry.resolve(defaultScenarioKey)

export const resolveDemoKitchenScenarioKey = (kitchenId?: string): ScenarioKey | null => {
  const id = normalize(kitchenId)
  if (!id) return null
  return isScenarioKey(id) ? id : null
}

export const getDemoKitchenScenario = (
  kitchenId?: string
): DemoKitchenScenario | null => {
  const scenarioKey = resolveDemoKitchenScenarioKey(kitchenId)
  if (!scenarioKey) return null
  return registry.get(scenarioKey) ?? registry.resolve(defaultScenarioKey)
}

export const getDemoKitchenScenarios = (): DemoKitchenScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))

export const getDemoKitchenScenarioList = (): DemoKitchenScenarioListItem[] =>
  registry.getList()

export const resolveScenario = resolveDemoKitchenScenario
export const defaultScenario = getDefaultDemoKitchenScenario
