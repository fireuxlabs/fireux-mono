import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: true,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/job/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Job',
    ignore: ['dev/**'],
  })

  registerComponentsDir(resolver, './runtime/job/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'DevJob',
  })
}
