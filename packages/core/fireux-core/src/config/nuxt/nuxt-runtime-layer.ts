import type { Nuxt } from 'nuxt/schema'

type RuntimeConfigRoot = Record<string, any>
type PublicRuntimeConfig = Record<string, any>

type LayerEntry = string | [string, Record<string, any>]

function ensureArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

export function ensureRuntimeConfigBuckets(nuxt: Nuxt, key: string) {
  if (!key) return
  const rc = (nuxt.options.runtimeConfig as unknown as RuntimeConfigRoot) ||
    ((nuxt.options.runtimeConfig = {} as any) as RuntimeConfigRoot)

  rc[key] ||= {}

  const pub = ((rc.public ||= {}) as PublicRuntimeConfig)
  pub[key] ||= {}
}

export function ensureRuntimeLayer(nuxt: Nuxt, runtimeDir: string) {
  if (!runtimeDir) return

  const ext = ensureArray<LayerEntry>((nuxt.options as any).extends)
  const already = ext.some((entry) =>
    Array.isArray(entry) ? entry[0] === runtimeDir : entry === runtimeDir
  )

  if (!already) ext.push(runtimeDir)

  ;(nuxt.options as any).extends = ext
}

export function exposeRuntimeAlias(
  nuxt: Nuxt,
  aliasKey: string,
  runtimeDir: string
) {
  if (!aliasKey || !runtimeDir) return

  nuxt.options.alias ||= {}
  nuxt.options.alias[aliasKey] = runtimeDir

  nuxt.hook('nitro:config', (nitroConfig: any) => {
    nitroConfig.alias ||= {}
    nitroConfig.alias[aliasKey] = runtimeDir
  })
}
