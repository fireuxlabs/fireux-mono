import { getLayerDirectories, type Resolver } from '@nuxt/kit'
import { resolve } from 'node:path'
import type { Nuxt } from '@nuxt/schema'

/** Runtime discovery must be configured before module setup through native layers. */
export function requireNativeRuntimeLayerFromPath(nuxt: Nuxt, runtimeDir: string) {
  const resolved = runtimeDir && resolve(runtimeDir)
  if (!resolved || !getLayerDirectories(nuxt).some(layer => resolve(layer.root) === resolved)) {
    throw new Error(`Missing native runtime layer: ${runtimeDir || '(empty path)'}. Declare the owning package's layer in the App config-time extends.`)
  }
  return runtimeDir
}

export function requireNativeRuntimeLayer(resolver: Resolver, nuxt: Nuxt) {
  return requireNativeRuntimeLayerFromPath(nuxt, resolver.resolve('./runtime'))
}
