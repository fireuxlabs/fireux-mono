import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/organisms/entities/Company', {
    global: true,
    pathPrefix: true,
    prefix: 'Company',
  })

  registerComponentAliases(
    resolver,
    './runtime/components/organisms/entities/Company',
    'Company'
  )
}