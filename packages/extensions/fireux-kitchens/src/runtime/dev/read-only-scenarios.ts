import { resolveScenario, type ScenarioKey } from '../../../../../../dummy/scenarios'

const readOnlyScenarioByKitchenId: Record<string, ScenarioKey> = {
  // Tiny burger ids
  'tiny-burger': 'tiny-burger',
  'ro-kitchen-burger-01': 'tiny-burger',

  // Takumi ramen ids
  'shio-ramen': 'takumi-ramen',
  'ro-kitchen-ramen-01': 'takumi-ramen',
}

const defaultScenarioKey: ScenarioKey = 'tiny-burger'

const normalize = (value: unknown) => String(value || '').trim()

export const resolveReadOnlyScenarioKey = (kitchenId?: string): ScenarioKey => {
  const id = normalize(kitchenId)
  if (!id) return defaultScenarioKey
  return readOnlyScenarioByKitchenId[id] ?? defaultScenarioKey
}

export const getReadOnlyKitchenScenario = (kitchenId?: string) =>
  resolveScenario(resolveReadOnlyScenarioKey(kitchenId))

export const getDefaultReadOnlyKitchenScenario = () => resolveScenario(defaultScenarioKey)
