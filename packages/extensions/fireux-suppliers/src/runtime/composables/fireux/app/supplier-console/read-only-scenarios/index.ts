import { createReadOnlyScenarioRegistry } from 'fireux-core/runtime/composables/fireux/runtime/createReadOnlyScenarioRegistry'
import { harborProvisionsScenario } from './harbor-provisions'
import { emberDistributionScenario } from './ember-distribution'
import type {
  ReadOnlySupplierScenario,
  ReadOnlySupplierScenarioListItem,
} from './_shared/types'

export type {
  ReadOnlySupplierApp,
  ReadOnlySupplierCore,
  ReadOnlySupplierScenario,
  ReadOnlySupplierScenarioListItem,
} from './_shared/types'

export type ScenarioKey = 'harbor-provisions' | 'ember-distribution'

export const scenarioKeys = [
  'harbor-provisions',
  'ember-distribution',
] as const satisfies readonly ScenarioKey[]

const defaultScenarioKey: ScenarioKey = 'harbor-provisions'
const normalize = (value: unknown) => String(value || '').trim()
const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const registry = createReadOnlyScenarioRegistry<
  ReadOnlySupplierScenario,
  ScenarioKey,
  ReadOnlySupplierScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: {
    'harbor-provisions': harborProvisionsScenario,
    'ember-distribution': emberDistributionScenario,
  },
  toListItem: (scenario) => ({
    id: scenario.id,
    name: scenario.name,
    label: scenario.label,
    image_url: scenario.image_url,
    mode: 'read-only',
  }),
})

export const getReadOnlySupplierScenario = (
  supplierId?: string
): ReadOnlySupplierScenario | null => {
  const candidate = normalize(supplierId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return registry.get(candidate)
}

export const getDefaultReadOnlySupplierScenario = (): ReadOnlySupplierScenario =>
  registry.resolve(defaultScenarioKey)

export const getReadOnlySupplierScenarioList = (): ReadOnlySupplierScenarioListItem[] =>
  registry.getList()

export const getReadOnlySupplierScenarios = (): ReadOnlySupplierScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))
