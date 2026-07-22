// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: scope ecosystem composition to Professional Experience, never Job roots.
import { addPlugin, type Resolver } from '@nuxt/kit'

export function configurePlugins(resolver: Resolver) {
  addPlugin({
    src: resolver.resolve('./runtime/plugins/jobs-kitchen-workplace.client.ts'),
    mode: 'client',
  })
}
