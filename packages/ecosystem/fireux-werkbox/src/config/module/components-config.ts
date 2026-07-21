// Concurrent edit — 2026-07-21 12:19 CEST — Cleanbox to Werkbox migration: provide the required ecosystem component registration seam.
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  const componentsDir = registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
    priority: 1,
  })

  if (!componentsDir) return

  ;(nuxt.options.alias ||= {}) as Record<string, string>
  ;(nuxt.options.alias as Record<string, string>)['#fireux-werkbox-components'] =
    componentsDir
}
