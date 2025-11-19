import type { ModuleEntry } from './module-utils'
import { env } from './env'

export interface RuntimeConfigOptions {
  ecosystem: string
  appId: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  modules: ModuleEntry[]
  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string
  centralSignupUrl?: string
  appIcon?: string
  developerPin?: string
  firebaseConfig: Record<string, any>
  serviceAccountJson?: string
  globalAppId?: string
  devMode: boolean
}

export function createRuntimeConfig(options: RuntimeConfigOptions) {
  const {
    ecosystem,
    appId,
    appName,
    appShortName,
    role,
    modules,
    primaryColor,
    neutralColor,
    secondaryColor,
    centralSignupUrl,
    appIcon,
    developerPin,
    firebaseConfig,
    serviceAccountJson,
    globalAppId,
    devMode,
  } = options

  return {
    googlePlacesApiKey: env('GOOGLE_PLACES_API_KEY'),
    firebaseServiceAccount:
      serviceAccountJson ?? env('FIREBASE_SERVICE_ACCOUNT'),
    public: {
      devMode,
      ecosystem,
      appId,
      appName,
      appShortName,
      primaryColor,
      neutralColor,
      secondaryColor,
      centralSignupUrl,
      appIcon,
      developerPin,
      firebaseConfig: { ...firebaseConfig },
      appSettings: {
        appId,
        ecosystem,
        appName,
        appShortName,
      },
      modules: modules.map((entry) =>
        Array.isArray(entry) ? entry[0] : entry
      ),
      role,
      globalAppId,
    },
  }
}
