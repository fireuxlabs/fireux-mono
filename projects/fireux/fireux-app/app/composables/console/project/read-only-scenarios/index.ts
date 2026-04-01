import { createReadOnlyScenarioRegistry } from 'fireux-core/runtime/composables/fireux/runtime/createReadOnlyScenarioRegistry'
import { fireuxControlRoomScenario } from './fireux-control-room'
import { fireuxLabsScenario } from './fireux-labs'
import { fireuxObservatoryScenario } from './fireux-observatory'
import type {
  ReadOnlyProjectScenario,
  ReadOnlyProjectScenarioListItem,
} from './_shared/types'

type ScenarioKey =
  | 'fireux-control-room'
  | 'fireux-labs'
  | 'fireux-observatory'

export const scenarioKeys = [
  'fireux-control-room',
  'fireux-labs',
  'fireux-observatory',
] as const satisfies readonly ScenarioKey[]
const defaultScenarioKey: ScenarioKey = 'fireux-control-room'
const normalize = (value: unknown) => String(value ?? '').trim()
const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

const registry = createReadOnlyScenarioRegistry<
  ReadOnlyProjectScenario,
  ScenarioKey,
  ReadOnlyProjectScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: defaultScenarioKey,
  builders: {
    'fireux-control-room': fireuxControlRoomScenario,
    'fireux-labs': fireuxLabsScenario,
    'fireux-observatory': fireuxObservatoryScenario,
  },
  toListItem: (scenario) => ({
    id: scenario.id,
    name: scenario.name,
    label: scenario.label,
    image_url: scenario.image_url,
    mode: 'read-only',
  }),
})

export const getReadOnlyProjectScenario = (
  projectId?: string
): ReadOnlyProjectScenario | null => {
  const candidate = normalize(projectId)
  if (!candidate || !isScenarioKey(candidate)) return null
  return registry.get(candidate)
}

export const getDefaultReadOnlyProjectScenario = (): ReadOnlyProjectScenario =>
  registry.resolve(defaultScenarioKey)

export const getReadOnlyProjectScenarioList = () => registry.getList()

export const getReadOnlyProjectScenarios = (): ReadOnlyProjectScenario[] =>
  scenarioKeys.map((scenarioKey) => registry.resolve(scenarioKey))
