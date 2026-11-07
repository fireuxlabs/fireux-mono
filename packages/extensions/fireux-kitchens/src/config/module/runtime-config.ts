import type { Nuxt } from '@nuxt/schema'
import {
  OrderChannels,
  type OrderingConfiguration,
} from '../../runtime/kitchen/models/order.model'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'

export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = {
    enabled: true,
    defaultKitchenId: '',
  }
) {
  configureRuntimeDefaults(nuxt, key, defaults, { merge: true })

  const runtimeConfig = (nuxt.options.runtimeConfig ||= {}) as Record<
    string,
    unknown
  >
  runtimeConfig.supplierDirectoryBaseUrl ||=
    nuxt.options.dev === true ? 'http://localhost:3006' : 'https://bringli.app'
}

/** Ordering stays opt-in; omission grants no channels. */
export function configureOrdering(
  nuxt: Nuxt,
  ordering?: OrderingConfiguration
) {
  if (ordering === undefined) return
  if (
    !ordering ||
    !Array.isArray(ordering.channels) ||
    ordering.channels.some((channel) => !OrderChannels.includes(channel))
  ) {
    throw new Error(
      '[fireux-kitchens] ordering.channels must contain supported Order channels.'
    )
  }
  nuxt.options.runtimeConfig.public.ordering = {
    channels: [...new Set(ordering.channels)],
  }
}
