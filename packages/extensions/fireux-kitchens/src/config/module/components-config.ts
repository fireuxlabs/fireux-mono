import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'Dev',
  })

  registerComponentsDir(resolver, './runtime/components/organisms/entities/Kitchen', {
    global: true,
    pathPrefix: true,
    prefix: 'Kitchen',
  })

  registerComponentsDir(resolver, './runtime/components/organisms/profiles/Chef', {
    global: true,
    pathPrefix: true,
    prefix: 'OrganismsProfilesChef',
  })

  registerComponentAliases(
    resolver,
    './runtime/components/organisms/entities/Kitchen',
    'Kitchen'
  )
}
