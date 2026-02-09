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

  registerComponentsDir(resolver, './runtime/components/organisms/Kitchen', {
    global: true,
    pathPrefix: true,
    prefix: 'Kitchen',
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Kitchen', 'Kitchen', {
    global: true,
  })

  registerComponentsDir(
    resolver,
    './runtime/components/organisms/Ingredient',
    {
      global: true,
      pathPrefix: true,
      prefix: 'Ingredient',
    }
  )
  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Ingredient',
    'Ingredient',
    {
      global: true,
    }
  )

  registerComponentsDir(resolver, './runtime/components/organisms/profiles/Chef', {
    global: true,
    pathPrefix: true,
    prefix: 'OrganismsProfilesChef',
  })
  registerComponentAliases(
    resolver,
    './runtime/components/organisms/profiles/Chef',
    'Chef',
    {
      global: true,
    }
  )

  // Aliases removed; rely on component directory registration.
}
