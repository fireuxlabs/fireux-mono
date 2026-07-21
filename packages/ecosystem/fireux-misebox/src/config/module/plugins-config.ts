// Concurrent edit — 2026-07-21 13:00 CEST — Misebox Jobs workplace adapter: register ecosystem-owned Jobs/Kitchen composition.
import { addPlugin, type Resolver } from '@nuxt/kit'

export function configurePlugins(resolver: Resolver) {
  addPlugin({
    src: resolver.resolve('./runtime/plugins/jobs-kitchen-workplace.client.ts'),
    mode: 'client',
  })
}
