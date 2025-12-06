import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configureTenantAssets } from 'fireux-core/config/tenant-config'

export function configureAssets(resolver: Resolver, nuxt: Nuxt) {
  configureTenantAssets(resolver, nuxt, {
    alias: '#fireux-misebox-public',
  })
}
