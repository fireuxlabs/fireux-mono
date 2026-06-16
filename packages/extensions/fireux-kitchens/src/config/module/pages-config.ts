import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { filterPagesByGlob } from 'fireux-core/config/module/pages-config'
import { ensureRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

function kitchenTargetIds(nuxt: Nuxt) {
  const runtimeConfig = record(nuxt.options.runtimeConfig)
  const publicRuntime = record(runtimeConfig.public)
  const fireux = record(publicRuntime.fireux)
  const consoleConfig = record(fireux.consoleConfig)
  const kitchenConfig = record(consoleConfig.kitchen)
  const targetIds = kitchenConfig.targetIds

  return Array.isArray(targetIds)
    ? targetIds
        .map((targetId) => String(targetId ?? '').trim())
        .filter(Boolean)
    : []
}

function hasSingleKitchenTarget(nuxt: Nuxt) {
  return kitchenTargetIds(nuxt).length === 1
}

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(resolver, nuxt)

  if (!hasSingleKitchenTarget(nuxt)) {
    filterPagesByGlob(nuxt, [
      '**/fireux-kitchens/src/runtime/pages/menus/**',
    ])
  }
}
