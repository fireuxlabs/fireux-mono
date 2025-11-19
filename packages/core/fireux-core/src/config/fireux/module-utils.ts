import type { NuxtConfig } from 'nuxt/schema'

export type ModuleEntry = string | [string, Record<string, any>]

type NitroOptions = NonNullable<NuxtConfig['nitro']>

export function dedupeKeepLast(mods: ModuleEntry[] = []): ModuleEntry[] {
  const map = new Map<string, ModuleEntry>()
  for (const entry of mods)
    map.set(Array.isArray(entry) ? entry[0] : entry, entry)
  const seen = new Set<string>()
  const ordered: ModuleEntry[] = []
  for (const entry of mods) {
    const id = Array.isArray(entry) ? entry[0] : entry
    if (!seen.has(id)) {
      seen.add(id)
      ordered.push(map.get(id)!)
    }
  }
  return ordered
}

export function mergeNitroExternals(
  externals: NitroOptions['externals'],
  additions: string[]
): NitroOptions['externals'] {
  if (!additions.length) return externals

  const additionSet = new Set(additions)

  if (externals === false) {
    return false
  }

  if (externals === undefined || externals === true) {
    return { external: Array.from(additionSet) }
  }

  if (Array.isArray(externals)) {
    for (const item of externals) additionSet.add(item)
    return Array.from(additionSet)
  }

  const next = { ...externals }
  const current = Array.isArray(next.external)
    ? next.external
    : next.external
    ? [next.external]
    : []

  for (const item of current) additionSet.add(item)

  next.external = Array.from(additionSet)

  return next
}
