// FILE: packages/core/fireux-core/src/config/module/plugins-config.ts
import { addPlugin, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configurePlugins(resolver: Resolver) {
  const plugins = [
    {
      src: resolver.resolve('./runtime/plugins/inject-trace.client.ts'),
      mode: 'client' as const,
    },
    {
      src: resolver.resolve('./runtime/plugins/inject-trace.server.ts'),
      mode: 'server' as const,
    },
  ]

  for (const p of plugins) {
    if (existsSync(p.src)) addPlugin(p)
  }
}
