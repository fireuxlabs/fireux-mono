import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configureTenantLayouts } from 'fireux-core/config/base/tenant-layer'

export function configureLayouts(resolver: Resolver, nuxt: Nuxt) {
  configureTenantLayouts(resolver, nuxt, { prefix: 'Fireux' })
}
