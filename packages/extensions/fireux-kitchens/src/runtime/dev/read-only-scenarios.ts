import {
  scenarioKeys,
  resolveScenario,
  type ScenarioKey,
} from '../composables/fireux/app/runtime-kitchen/read-only-scenarios'

const defaultScenarioKey: ScenarioKey = 'stack-sizzle'

const normalize = (value: unknown) => String(value || '').trim()
const isScenarioKey = (value: string): value is ScenarioKey =>
  scenarioKeys.includes(value as ScenarioKey)

export const resolveReadOnlyScenarioKey = (kitchenId?: string): ScenarioKey => {
  const id = normalize(kitchenId)
  if (!id) return defaultScenarioKey
  return isScenarioKey(id) ? id : defaultScenarioKey
}

export const getReadOnlyKitchenScenario = (kitchenId?: string) =>
  resolveScenario(resolveReadOnlyScenarioKey(kitchenId))

export const getDefaultReadOnlyKitchenScenario = () => resolveScenario(defaultScenarioKey)

export const getReadOnlyKitchenScenarioList = () =>
  scenarioKeys.map((scenarioKey) => {
    const scenario = resolveScenario(scenarioKey)
    const kitchen = (scenario.kitchen ?? {}) as Record<string, unknown>
    const id = normalize(kitchen.id || scenarioKey)
    const name = normalize(kitchen.name || id)
    const addressLabel =
      normalize(kitchen.short_address) ||
      normalize(kitchen.formatted_address)
    const imageUrl = normalize(kitchen.image_url)

    return {
      id,
      name,
      address_label: addressLabel,
      image_url: imageUrl,
      mode: 'read-only' as const,
    }
  })
