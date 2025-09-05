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
  // Work with a lenient view of runtimeConfig to avoid strict typing pitfalls
  const rc = nuxt.options.runtimeConfig as any
  // Ensure public exists and satisfies modules that narrow types (e.g., @nuxtjs/mdc)
  rc.public ||= {}
  rc.public.mdc ||= {}
  const pub: Record<string, any> = rc.public

  // Bucket under public.fireux
  if (!pub.fireux) pub.fireux = {}
  const fireux = pub.fireux as Record<string, any>

  // Merge defaults into this namespace (don’t overwrite existing)
  fireux[key] = { ...(fireux[key] || {}), ...defaults }
}
