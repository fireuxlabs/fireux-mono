import { addComponentsDir, type Resolver } from '@nuxt/kit'
import { registerComponentAliases } from 'fireux-core/config/module/module-helpers'
import { existsSync } from 'node:fs'

export function configureComponents(resolver: Resolver) {
  const dir = resolver.resolve('./runtime/components')
  if (!existsSync(dir)) return

  addComponentsDir({
    path: dir,
    pattern: '**/*.vue',
    global: false,
    pathPrefix: true,
  })

  registerComponentAliases(resolver, './runtime/components/organisms/App', 'App', {
    global: true,
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Auth', 'Auth', {
    global: true,
  })
  registerComponentAliases(resolver, './runtime/components/organisms/User', 'User', {
    global: true,
  })
}
