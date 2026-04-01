export type RuntimeKitchenMode = 'read-only' | 'live'

export type RuntimeKitchenSelection = {
  kitchenId?: string | null | undefined
  mode?: RuntimeKitchenMode | null | undefined
}

export const RUNTIME_KITCHEN_ID_KEY = 'fireux-kitchens:runtime-kitchen:id'
export const RUNTIME_KITCHEN_MODE_KEY = 'fireux-kitchens:runtime-kitchen:mode'
export const ROOT_KITCHEN_COLLECTION_PATH = 'kitchens'

const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeMode = (value: unknown): RuntimeKitchenMode | null => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'dummy' || normalized === 'readonly') return 'read-only'
  if (normalized === 'read-only') {
    return normalized
  }
  return null
}

export const resolveKitchenConsoleCollectionPath = (appId?: unknown): string => {
  const resolvedAppId = normalizeString(appId)
  return resolvedAppId
    ? `apps/${resolvedAppId}/${ROOT_KITCHEN_COLLECTION_PATH}`
    : ROOT_KITCHEN_COLLECTION_PATH
}

export const resolveKitchenRuntimeCollectionBasePath = (
  overridePath?: unknown,
  appId?: unknown
): string => {
  const resolvedOverride = normalizeString(overridePath)
  return resolvedOverride || resolveKitchenConsoleCollectionPath(appId)
}

export const resolveKitchenRuntimeChildCollectionPath = (input: {
  kitchenCollectionPath?: unknown
  kitchenId?: unknown
  collectionName: string
  appId?: unknown
}): string => {
  const basePath = resolveKitchenRuntimeCollectionBasePath(
    input.kitchenCollectionPath,
    input.appId
  )
  const kitchenId = normalizeString(input.kitchenId)
  const collectionName = normalizeString(input.collectionName)
  if (!basePath || !kitchenId || !collectionName) return ''
  return `${basePath}/${kitchenId}/${collectionName}`
}

export const resolveRuntimeKitchenDocumentCollectionPath = (
  mode: RuntimeKitchenMode
): string => ROOT_KITCHEN_COLLECTION_PATH

export const resolveRuntimeKitchenDataCollectionPath = (
  mode: RuntimeKitchenMode,
  appId?: unknown
): string => resolveKitchenConsoleCollectionPath(appId)

export const resolveRuntimeKitchenCollectionPath =
  resolveRuntimeKitchenDocumentCollectionPath
