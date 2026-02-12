export type RuntimeKitchenMode = 'dummy' | 'test' | 'live'

export type RuntimeKitchenSelection = {
  kitchenId?: string | null | undefined
  mode?: RuntimeKitchenMode | null | undefined
}

export const RUNTIME_KITCHEN_ID_KEY = 'fireux-kitchens:runtime-kitchen:id'
export const RUNTIME_KITCHEN_MODE_KEY = 'fireux-kitchens:runtime-kitchen:mode'

const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeMode = (value: unknown): RuntimeKitchenMode | null => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'dummy' || normalized === 'test' || normalized === 'live') {
    return normalized
  }
  return null
}

export const resolveRuntimeKitchenCollectionPath = (
  mode: RuntimeKitchenMode
): 'kitchens' | 'test-kitchens' => (mode === 'live' ? 'kitchens' : 'test-kitchens')
