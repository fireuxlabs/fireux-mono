import type { Nuxt } from '@nuxt/schema'

/**
 * Ensure a stable namespace at runtimeConfig.public.fireux[key]
 * Used by fireux-core/module.ts during setup.
 */
export function configureRuntime(
  nuxt: Nuxt,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  // Always mutate nuxt.options.runtimeConfig at module setup
  const rc = (nuxt.options.runtimeConfig ||= {} as any)
  rc.public ||= {}
  const pub = rc.public as Record<string, any>

  // Bucket under public.fireux
  if (!pub.fireux) pub.fireux = {}
  const fireux = pub.fireux as Record<string, any>

  // Merge defaults into this namespace (don’t overwrite existing)
  fireux[key] = { ...(fireux[key] || {}), ...defaults }
}
