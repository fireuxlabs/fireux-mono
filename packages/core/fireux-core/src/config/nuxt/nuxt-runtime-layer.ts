import type { Nuxt } from 'nuxt/schema'
import {
  ensureRuntimeConfigBuckets,
  ensureRuntimeLayerFromPath,
  exposeRuntimeAlias,
} from '../module/runtime-layer'

export { ensureRuntimeConfigBuckets, exposeRuntimeAlias }

export function ensureRuntimeLayer(nuxt: Nuxt, runtimeDir: string) {
  ensureRuntimeLayerFromPath(nuxt, runtimeDir)
}
