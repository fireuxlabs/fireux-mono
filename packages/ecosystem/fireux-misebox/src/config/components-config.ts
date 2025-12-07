import type { Resolver } from '@nuxt/kit'
import { configureTenantComponents } from 'fireux-core/config/base/tenant-layer'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string } = {}
) {
  configureTenantComponents(resolver, {
    prefix: options.prefix ?? 'Mise',
    pathPrefix: true,
  })
}
