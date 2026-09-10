import type { RuntimeApp, RuntimeFirebaseEcosystem, RuntimeFirebaseApp, RuntimePrivate } from '../config/app/runtime'

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    fireux: Partial<RuntimeApp>
    firebaseEcosystem: Partial<RuntimeFirebaseEcosystem>
    firebaseApp: Partial<RuntimeFirebaseApp>
  }
  interface RuntimeConfig {
    fireux: RuntimePrivate
  }
}
export {}
