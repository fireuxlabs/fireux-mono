import type { Nuxt } from '@nuxt/schema'

/**
 * Creates/merges runtimeConfig.public.fireux[key] early in module setup.
 */
export function configureRuntime(
  nuxt: Nuxt,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  // Write to options so it's baked into the build
  // Some Nuxt internals may normalize options lazily; ensure the container exists
  const n: any = nuxt as any
  if (!n.options) n.options = {}
  const rc = (n.options.runtimeConfig ||= {} as any)
  if (!rc.public) rc.public = {}
  const pub = rc.public as Record<string, any>
  if (!pub.fireux) pub.fireux = {}
  const fireux = pub.fireux as Record<string, any>

  // Merge without clobbering
  fireux[key] = { ...(fireux[key] ?? {}), ...(defaults ?? {}) }

  // (optional) return reference for debugging/chaining
  return fireux[key]
}
