import { createDemoScenarioRegistry } from 'fireux-core/runtime/composables/fireux/console/createDemoScenarioRegistry'
import { harborProvisionsScenario } from './harbor-provisions'
import { supplyLoopDistributionScenario } from './supply-loop-distribution'
import type { DemoSupplierScenario, DemoSupplierScenarioListItem } from './_shared/types'

export type {
  DemoSupplierApp,
  DemoSupplierCore,
} from './_shared/types'

export type ScenarioKey = 'harbor-provisions' | 'supply-loop-distribution'

export const scenarioKeys = [
  'harbor-provisions',
  'supply-loop-distribution',
] as const satisfies readonly ScenarioKey[]

const defaultScenarioKey: ScenarioKey = 'harbor-provisions'
const normalize = (value: unknown) => String(value || '').trim()
const scenarioBuilders: Record<ScenarioKey, () => DemoSupplierScenario> = {
  'harbor-provisions': harborProvisionsScenario,
  'supply-loop-distribution': supplyLoopDistributionScenario,
}
const registry = createDemoScenarioRegistry<
  DemoSupplierScenario,
  ScenarioKey,
  DemoSupplierScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: scenarioBuilders,
  toListItem: (scenario) => ({
    id: scenario.id,
    name: scenario.name,
    label: scenario.label,
    image_url: scenario.image_url,
    mode: 'demo',
  }),
})

export const getDemoSupplierScenario = (
  supplierId?: string
): DemoSupplierScenario | null => {
  const candidate = normalize(supplierId)
  if (!candidate) return null
  return registry.get(candidate as ScenarioKey) ?? registry.resolve(defaultScenarioKey)
}

export const getDefaultDemoSupplierScenario = (): DemoSupplierScenario =>
  registry.resolve(defaultScenarioKey)

export const getDemoSupplierScenarioList = (): DemoSupplierScenarioListItem[] =>
  registry.getList()

export const getDemoSupplierScenarios = (): DemoSupplierScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))
