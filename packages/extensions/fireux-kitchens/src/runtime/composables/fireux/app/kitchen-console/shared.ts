const normalizeString = (value: unknown): string => String(value ?? '').trim()

type ResolveKitchenChildCollectionBasePathOptions = {
  kitchenCollectionPath?: string | null | undefined
  collectionName?: string
  appId?: string | null | undefined
}

type ResolveKitchenRuntimeChildCollectionPathOptions = {
  kitchenCollectionPath?: string | null | undefined
  kitchenId?: string | null | undefined
  collectionName?: string | null | undefined
  appId?: string | null | undefined
}

export { normalizeString }

export const ROOT_KITCHEN_COLLECTION_PATH = 'kitchens'

export const resolveKitchenConsoleCollectionPath = (
  appId?: string | null | undefined
): string => {
  const resolvedAppId = normalizeString(appId)
  return resolvedAppId ? `apps/${resolvedAppId}/kitchens` : 'kitchens'
}

export const resolveKitchenRuntimeCollectionBasePath = (
  kitchenCollectionPath?: string | null | undefined,
  appId?: string | null | undefined
): string => {
  const explicitPath = normalizeString(kitchenCollectionPath)
  if (explicitPath) return explicitPath
  return resolveKitchenConsoleCollectionPath(appId)
}

export const resolveKitchenChildCollectionBasePath = (
  options: ResolveKitchenChildCollectionBasePathOptions = {}
): string => {
  return resolveKitchenRuntimeCollectionBasePath(
    options.kitchenCollectionPath,
    options.appId
  )
}

export const resolveKitchenRuntimeChildCollectionPath = (
  options: ResolveKitchenRuntimeChildCollectionPathOptions = {}
): string => {
  const basePath = resolveKitchenRuntimeCollectionBasePath(
    options.kitchenCollectionPath,
    options.appId
  )
  const kitchenId = normalizeString(options.kitchenId)
  const collectionName = normalizeString(options.collectionName)

  if (!basePath || !kitchenId || !collectionName) return ''

  return `${basePath}/${kitchenId}/${collectionName}`
}
