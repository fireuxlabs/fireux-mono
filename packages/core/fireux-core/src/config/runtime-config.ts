import type { Nuxt } from '@nuxt/schema'

/**
 * Creates/merges runtimeConfig.public.fireux[key] early in module setup.
 */
export function configureRuntime(
  nuxt: Nuxt,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  // Prefer writing to options so it's baked into the build
  const n: any = nuxt as any
  let pub: Record<string, any> | undefined
  if (n.options && typeof n.options === 'object') {
    if (!n.options.runtimeConfig) n.options.runtimeConfig = {}
  const rc = n.options.runtimeConfig
    if (!rc.public) rc.public = {}
    pub = rc.public as Record<string, any>
  } else {
    // Fallback for early phases: use live runtimeConfig to avoid crashes in dev
    const live = (n.runtimeConfig ||= {})
    if (!live.public) live.public = {}
    pub = live.public as Record<string, any>
  }
  if (!pub.fireux) pub.fireux = {}
  const fireux = pub.fireux as Record<string, any>

  // Merge without clobbering
  fireux[key] = { ...(fireux[key] ?? {}), ...(defaults ?? {}) }

  // (optional) return reference for debugging/chaining
  return fireux[key]
}
