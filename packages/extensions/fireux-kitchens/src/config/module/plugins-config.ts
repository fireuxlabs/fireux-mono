import { addPlugin, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configurePlugins(resolver: Resolver) {
  const plugins = [
    {
      src: resolver.resolve('./runtime/plugins/ensure-test-kitchen.client.ts'),
      mode: 'client' as const,
    },
  ]

  for (const plugin of plugins) {
    if (existsSync(plugin.src)) addPlugin(plugin)
  }
}
