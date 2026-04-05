import { createDemoScenarioRegistry } from 'fireux-core/runtime/composables/fireux/runtime/createDemoScenarioRegistry'
import { cedarLoopScenario } from './cedar-loop'
import { harborGridScenario } from './harbor-grid'
import { northstarWorksScenario } from './northstar-works'
import type { DemoProjectScenario, DemoProjectScenarioListItem } from './_shared/types'
export type { DemoProjectScenario, DemoProjectScenarioListItem } from './_shared/types'

type ScenarioKey =
  | 'northstar-works'
  | 'harbor-grid'
  | 'cedar-loop'

export const scenarioKeys = [
  'northstar-works',
  'harbor-grid',
  'cedar-loop',
] as const satisfies readonly ScenarioKey[]
const defaultScenarioKey: ScenarioKey = 'northstar-works'
const normalize = (value: unknown) => String(value ?? '').trim()
const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const registry = createDemoScenarioRegistry<
  DemoProjectScenario,
  ScenarioKey,
  DemoProjectScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: {
    'northstar-works': northstarWorksScenario,
    'harbor-grid': harborGridScenario,
    'cedar-loop': cedarLoopScenario,
  },
  toListItem: (scenario) => ({
    id: scenario.id,
    name: scenario.name,
    label: scenario.label,
    image_url: scenario.image_url,
    mode: 'demo',
  }),
})

export const getDemoProjectScenario = (
  projectId?: string
): DemoProjectScenario | null => {
  const candidate = normalize(projectId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return registry.get(candidate)
}

export const getDefaultDemoProjectScenario = (): DemoProjectScenario =>
  registry.resolve(defaultScenarioKey)

export const getDemoProjectScenarioList = (): DemoProjectScenarioListItem[] => registry.getList()

export const getDemoProjectScenarios = (): DemoProjectScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))
