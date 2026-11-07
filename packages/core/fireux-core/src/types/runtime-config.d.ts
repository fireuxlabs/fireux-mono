import type { AppTheme } from './theme'
import type { RuntimeApp, RuntimeFirebaseEcosystem, RuntimeFirebaseApp, RuntimePrivate } from '../config/app/runtime'

declare module '@nuxt/schema' {
  interface AppConfigInput {
    theme?: AppTheme
  }
  interface AppConfig {
    theme?: AppTheme
  }
  interface PublicRuntimeConfig {
    packageComponents?: Record<string, string[]>
    fireux: Partial<RuntimeApp>
    firebaseEcosystem: Partial<RuntimeFirebaseEcosystem>
    firebaseApp: Partial<RuntimeFirebaseApp>
  }
  interface RuntimeConfig {
    fireux: RuntimePrivate
  }
}
export {}
