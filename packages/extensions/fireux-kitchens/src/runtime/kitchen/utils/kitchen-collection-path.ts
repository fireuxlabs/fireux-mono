export const normalizeString = (value: unknown): string =>
  String(value ?? '').trim()

type ResolveKitchenChildCollectionBasePathOptions = {
  kitchenCollectionPath?: string | null | undefined
  collectionName?: string
  appId?: string | null | undefined
}

type ResolveKitchenChildCollectionPathOptions = {
  kitchenCollectionPath?: string | null | undefined
  kitchenId?: string | null | undefined
  collectionName?: string | null | undefined
  appId?: string | null | undefined
}

export const ROOT_KITCHEN_COLLECTION_PATH = 'kitchens'

export const resolveKitchenScopeCollectionPath = (
  _appId?: string | null | undefined
): string => 'kitchens'

export const resolveKitchenCollectionBasePath = (
  kitchenCollectionPath?: string | null | undefined,
  appId?: string | null | undefined
): string => {
  const explicitPath = normalizeString(kitchenCollectionPath)
  if (kitchenCollectionPath !== undefined) return explicitPath
  return resolveKitchenScopeCollectionPath(appId)
}

export const resolveKitchenChildCollectionBasePath = (
  options: ResolveKitchenChildCollectionBasePathOptions = {}
): string => {
  return resolveKitchenCollectionBasePath(
    options.kitchenCollectionPath,
    options.appId
  )
}

export const resolveKitchenChildCollectionPath = (
  options: ResolveKitchenChildCollectionPathOptions = {}
): string => {
  const basePath = resolveKitchenCollectionBasePath(
    options.kitchenCollectionPath,
    options.appId
  )
  const kitchenId = normalizeString(options.kitchenId)
  const collectionName = normalizeString(options.collectionName)

  if (!basePath || !kitchenId || !collectionName) return ''

  return `${basePath}/${kitchenId}/${collectionName}`
}

