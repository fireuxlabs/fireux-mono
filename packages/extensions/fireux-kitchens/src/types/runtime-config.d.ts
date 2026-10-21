import type { OrderingConfiguration } from '../runtime/kitchen/models/order.model'

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    ordering?: OrderingConfiguration
  }
}

export {}
