import {
  resolveScenario,
  type ScenarioKey,
} from '../composables/fireux/app/runtime-kitchen/read-only-scenarios'

const readOnlyScenarioByKitchenId: Record<string, ScenarioKey> = {
  // Canon read-only ids
  'stack-sizzle': 'stack-sizzle',
  'takumi-ramen': 'takumi-ramen',
  'broth-bloom': 'broth-bloom',

  // Legacy aliases (safe migration for any persisted runtime state)
  'tiny-burger': 'stack-sizzle',
  'ro-kitchen-burger-01': 'stack-sizzle',
  'shio-ramen': 'takumi-ramen',
  'ro-kitchen-ramen-01': 'broth-bloom',
}

const defaultScenarioKey: ScenarioKey = 'stack-sizzle'

const normalize = (value: unknown) => String(value || '').trim()

export const resolveReadOnlyScenarioKey = (kitchenId?: string): ScenarioKey => {
  const id = normalize(kitchenId)
  if (!id) return defaultScenarioKey
  return readOnlyScenarioByKitchenId[id] ?? defaultScenarioKey
}

export const getReadOnlyKitchenScenario = (kitchenId?: string) =>
  resolveScenario(resolveReadOnlyScenarioKey(kitchenId))

export const getDefaultReadOnlyKitchenScenario = () => resolveScenario(defaultScenarioKey)
