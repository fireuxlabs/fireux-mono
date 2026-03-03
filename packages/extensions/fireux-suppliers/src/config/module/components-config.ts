import type { Resolver } from '@nuxt/kit'
import {
    registerComponentAliases,
    registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
  })

  registerComponentAliases(
    resolver,
    './runtime/components/supplier',
    'Supplier',
    { global: true }
  )
  registerComponentAliases(
    resolver,
    './runtime/components/supplier',
    'ProfilesSupplier',
    { global: true }
  )
}
