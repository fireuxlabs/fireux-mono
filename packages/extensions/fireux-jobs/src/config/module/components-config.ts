import type { Resolver } from '@nuxt/kit'
import {
    registerComponentAliases,
    registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/organisms/Job', {
    global: true,
    pathPrefix: true,
    prefix: 'Job',
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Job', 'Job', {
    global: true,
  })

  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Agent',
    'Agent',
    { global: true }
  )
  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Agent',
    'ProfilesAgent',
    { global: true }
  )
  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Professional',
    'Professional',
    { global: true }
  )
  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Professional',
    'ProfilesProfessional',
    { global: true }
  )
}
