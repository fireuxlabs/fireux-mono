export type RuntimeKitchenMode = 'demo' | 'live' | 'test'

export type RuntimeKitchenSelection = {
  kitchenId?: string | null | undefined
  mode?: RuntimeKitchenMode | null | undefined
}

export const RUNTIME_KITCHEN_ID_KEY = 'fireux-kitchens:runtime-kitchen:id'
export const RUNTIME_KITCHEN_MODE_KEY = 'fireux-kitchens:runtime-kitchen:mode'
export const ROOT_KITCHEN_COLLECTION_PATH = 'kitchens'
export const ROOT_PUBLIC_KITCHEN_CHILD_COLLECTIONS = ['menus', 'dishes'] as const

const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeMode = (value: unknown): RuntimeKitchenMode | null => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'demo') return 'demo'
  if (normalized === 'live' || normalized === 'test') {
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

export const isRootPublicKitchenChildCollection = (collectionName?: unknown): boolean =>
  ROOT_PUBLIC_KITCHEN_CHILD_COLLECTIONS.includes(
    normalizeString(collectionName) as (typeof ROOT_PUBLIC_KITCHEN_CHILD_COLLECTIONS)[number]
  )

export const resolveKitchenChildCollectionBasePath = (input: {
  kitchenCollectionPath?: unknown
  collectionName?: unknown
  appId?: unknown
}): string => {
  const collectionName = normalizeString(input.collectionName)
  const resolvedOverride = normalizeString(input.kitchenCollectionPath)
  const appBasePath = resolveKitchenConsoleCollectionPath(input.appId)

  if (isRootPublicKitchenChildCollection(collectionName)) {
    if (resolvedOverride && resolvedOverride !== appBasePath) return resolvedOverride
    return ROOT_KITCHEN_COLLECTION_PATH
  }

  return resolveKitchenRuntimeCollectionBasePath(input.kitchenCollectionPath, input.appId)
}

export const resolveKitchenRuntimeChildCollectionPath = (input: {
  kitchenCollectionPath?: unknown
  kitchenId?: unknown
  collectionName: string
  appId?: unknown
}): string => {
  const basePath = resolveKitchenChildCollectionBasePath(input)
  const kitchenId = normalizeString(input.kitchenId)
  const collectionName = normalizeString(input.collectionName)
  if (!basePath || !kitchenId || !collectionName) return ''
  return `${basePath}/${kitchenId}/${collectionName}`
}

export const resolveRuntimeKitchenDocumentCollectionPath = (
  mode: RuntimeKitchenMode
): string => (mode === 'test' ? 'test-kitchens' : ROOT_KITCHEN_COLLECTION_PATH)

export const resolveRuntimeKitchenDataCollectionPath = (
  mode: RuntimeKitchenMode,
  appId?: unknown
): string => (mode === 'test' ? 'test-kitchens' : resolveKitchenConsoleCollectionPath(appId))

export const resolveRuntimeKitchenCollectionPath =
  resolveRuntimeKitchenDocumentCollectionPath
