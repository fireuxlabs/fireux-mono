import { ensureRuntimeLayer } from './runtime-layer.mjs'

export function configurePages(resolver, nuxt) {
  ensureRuntimeLayer(resolver, nuxt)
}