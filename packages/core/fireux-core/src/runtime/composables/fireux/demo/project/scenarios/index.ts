import { cedarLoopScenario } from './cedar-loop'
import { harborGridScenario } from './harbor-grid'
import { northstarWorksScenario } from './northstar-works'
import type { DemoProjectScenario, DemoProjectScenarioListItem } from './_shared/types'

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

const scenarioBuilders: Record<ScenarioKey, () => DemoProjectScenario> = {
  'northstar-works': northstarWorksScenario,
  'harbor-grid': harborGridScenario,
  'cedar-loop': cedarLoopScenario,
}

const resolveScenario = (scenarioKey: ScenarioKey): DemoProjectScenario =>
  scenarioBuilders[scenarioKey]()

const toListItem = (scenario: DemoProjectScenario): DemoProjectScenarioListItem => ({
  id: scenario.id,
  name: scenario.name,
  label: scenario.label,
  image_url: scenario.image_url,
  mode: 'demo',
})

export const getDemoProject = (
  projectId?: string
): DemoProjectScenario | null => {
  const candidate = normalize(projectId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return resolveScenario(candidate)
}

export const getDefaultDemoProject = (): DemoProjectScenario =>
  resolveScenario(defaultScenarioKey)

export const getDemoProjects = (): DemoProjectScenarioListItem[] =>
  scenarioKeys.map((scenarioKey) => toListItem(resolveScenario(scenarioKey)))

export const getDemoProjectScenarios = (): DemoProjectScenario[] =>
  scenarioKeys.map((scenarioKey) => resolveScenario(scenarioKey))
