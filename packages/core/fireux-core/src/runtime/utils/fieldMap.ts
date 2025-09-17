// packages/core/fireux-core/src/runtime/utils/fieldMap.ts
export type MapDef = Record<string, string>

export interface MapOptions {
  /** drop keys whose value is undefined or null */
  dropNullish?: boolean
}

export function createFieldMapper<
  TUi extends Record<string, any>,
  TFs extends Record<string, any>,
>(map: MapDef) {
  // Passthrough: keys not present in `map` are copied unchanged in both directions.
  const reverse = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [v, k])
  ) as Record<string, string>

  function toFs(ui: Partial<TUi>, opts: MapOptions = {}): Partial<TFs> {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(ui ?? {})) {
      if (opts.dropNullish && (v === undefined || v === null)) continue
      const target = (map as Record<string, string>)[k] ?? k
      out[target] = v
    }
    return out as Partial<TFs>
  }

  function fromFs(fs: Partial<TFs>, opts: MapOptions = {}): Partial<TUi> {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(fs ?? {})) {
      if (opts.dropNullish && (v === undefined || v === null)) continue
      const target = reverse[k] ?? k
      out[target] = v
    }
    return out as Partial<TUi>
  }

  return { toFs, fromFs }
}
