import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/job/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Job',
    ignore: ['dev/**'],
  })

  registerComponentsDir(resolver, './runtime/job/components/dev', {
    global: false,
    pathPrefix: true,
    prefix: 'DevJob',
  })
}
