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
const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const scenarioBuilders: Record<ScenarioKey, () => DemoSupplierScenario> = {
  'harbor-provisions': harborProvisionsScenario,
  'supply-loop-distribution': supplyLoopDistributionScenario,
}

const cache = new Map<ScenarioKey, DemoSupplierScenario>(
  scenarioKeys.map((key) => [key, scenarioBuilders[key]()] as const)
)

const registry = {
  resolve: (key: ScenarioKey): DemoSupplierScenario => scenarioBuilders[key](),
  get: (id?: string): DemoSupplierScenario | null => {
    const candidate = normalize(id)
    if (!candidate) return null
    const key = isScenarioKey(candidate) ? candidate : defaultScenarioKey
    return cache.get(key) ?? cache.get(defaultScenarioKey) ?? null
  },
  getList: (): DemoSupplierScenarioListItem[] =>
    scenarioKeys.map((key) => {
      const scenario = cache.get(key) ?? scenarioBuilders[key]()
      return {
        id: scenario.id,
        name: scenario.name,
        label: scenario.label,
        image_url: scenario.image_url,
        mode: 'demo',
      }
    }),
}

export const getDemoSupplierScenario = (
  supplierId?: string
): DemoSupplierScenario | null => {
  const candidate = normalize(supplierId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return registry.get(candidate)
}

export const getDefaultDemoSupplierScenario = (): DemoSupplierScenario =>
  registry.resolve(defaultScenarioKey)

export const getDemoSupplierScenarioList = (): DemoSupplierScenarioListItem[] =>
  registry.getList()

export const getDemoSupplierScenarios = (): DemoSupplierScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))
