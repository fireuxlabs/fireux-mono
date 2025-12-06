import type { Resolver } from '@nuxt/kit'
import { configureTenantComponents } from 'fireux-core/config/tenant-config'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string } = {}
) {
  configureTenantComponents(resolver, {
    prefix: options.prefix ?? 'Mise',
    pathPrefix: true,
  })
}
