import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/user/components', {
    global: false,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/job/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Job',
    ignore: ['Diagnostics/**'],
  })

  registerComponentsDir(resolver, './runtime/job/components/Diagnostics', {
    global: false,
    pathPrefix: true,
    prefix: 'DiagnosticsJob',
  })
}
