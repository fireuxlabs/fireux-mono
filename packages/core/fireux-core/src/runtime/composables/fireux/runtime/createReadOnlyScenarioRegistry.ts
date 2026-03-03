export type ReadOnlyScenarioRegistry<TScenario, TKey extends string, TListItem> = {
  keys: readonly TKey[]
  resolve: (key: TKey) => TScenario
  get: (id?: string) => TScenario | null
  getList: () => TListItem[]
}

const normalize = (value: unknown) => String(value ?? '').trim()

/**
 * Shared read-only scenario registry (pattern only).
 * Scenario DATA remains in the extension package.
 */
export function createReadOnlyScenarioRegistry<
  TScenario,
  TKey extends string,
  TListItem
>(params: {
  keys: readonly TKey[]
  defaultKey: TKey
  builders: Record<TKey, () => TScenario>
  toListItem: (scenario: TScenario, key: TKey) => TListItem
  allowEmptyId?: boolean
}): ReadOnlyScenarioRegistry<TScenario, TKey, TListItem> {
  const { keys, builders, defaultKey } = params

  const cache = new Map<TKey, TScenario>(
    keys.map((key) => [key, builders[key]()] as const)
  )

  const isKey = (value: string): value is TKey => keys.includes(value as TKey)

  const resolve = (key: TKey): TScenario => builders[key]()

  const get = (id?: string): TScenario | null => {
    const candidate = normalize(id)

    if (!candidate) {
      return params.allowEmptyId ? cache.get(defaultKey) ?? null : null
    }

    const key = isKey(candidate) ? (candidate as TKey) : defaultKey
    return cache.get(key) ?? cache.get(defaultKey) ?? null
  }

  const getList = () => keys.map((key) => params.toListItem(cache.get(key) ?? builders[key](), key))

  return {
    keys,
    resolve,
    get,
    getList,
  }
}
