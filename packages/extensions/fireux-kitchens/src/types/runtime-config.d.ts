import type { OrderingConfiguration } from './ordering'

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    ordering?: OrderingConfiguration
  }
}

export {}
