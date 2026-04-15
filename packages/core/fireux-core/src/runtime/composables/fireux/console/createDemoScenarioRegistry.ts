type DemoScenarioRegistryOptions<
  TScenario,
  TKey extends string,
  TListItem,
> = {
  keys: readonly TKey[]
  defaultKey: TKey
  builders: Record<TKey, () => TScenario>
  toListItem: (scenario: TScenario) => TListItem
}

type DemoScenarioRegistry<TScenario, TKey extends string, TListItem> = {
  resolve: (key: TKey) => TScenario
  get: (id?: string) => TScenario | null
  getList: () => TListItem[]
}

const normalize = (value: unknown): string => String(value ?? '').trim()

/**
 * Shared registry for demo console scenarios.
 * Keeps the demo scenario catalogs deterministic and reusable across console families.
 */
export function createDemoScenarioRegistry<
  TScenario,
  TKey extends string,
  TListItem,
>(options: DemoScenarioRegistryOptions<TScenario, TKey, TListItem>): DemoScenarioRegistry<TScenario, TKey, TListItem> {
  const cache = new Map<TKey, TScenario>(
    options.keys.map((key) => [key, options.builders[key]()] as const)
  )

  return {
    resolve: (key: TKey): TScenario => options.builders[key](),
    get: (id?: string): TScenario | null => {
      const candidate = normalize(id)
      if (!candidate) return null

      const key = options.keys.includes(candidate as TKey)
        ? (candidate as TKey)
        : null

      if (!key) return null

      return cache.get(key) ?? cache.get(options.defaultKey) ?? null
    },
    getList: (): TListItem[] =>
      options.keys.map((key) => {
        const scenario = cache.get(key) ?? options.builders[key]()
        return options.toListItem(scenario)
      }),
  }
}
