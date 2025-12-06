import {
  readServiceAccount,
  type ServiceAccountPayload,
} from './service-account'
import { createVuefireConfig } from './vuefire-config'
import { createPwaConfig } from './pwa-config'
import type { TenantConfig } from './tenant-config'
import type { TenantBasics } from './tenant-basics'
import type { TenantTheme } from './tenant-theme'

export interface TenantIntegrations {
  serviceAccount?: ServiceAccountPayload
  vuefireConfig: Record<string, any>
  pwaConfig: Record<string, any>
  firebaseConfig: Record<string, any>
}

export function resolveTenantIntegrations(
  basics: TenantBasics,
  theme: TenantTheme,
  opts: TenantConfig
): TenantIntegrations {
  const serviceAccount = readServiceAccount(basics.ecosystem)

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && serviceAccount?.json) {
    // Surface the service account early so nuxt-vuefire treats SSR as configured
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccount.json
  }

  const vuefireConfig = createVuefireConfig({
    overrides: opts.vuefire,
    serviceAccount: serviceAccount?.credentials,
  })

  const pwaConfig = createPwaConfig({
    appName: basics.appName,
    appShortName: basics.appShortName,
    themeColor: theme.primaryColor,
    overrides: opts.pwa,
  })

  return {
    serviceAccount,
    vuefireConfig,
    pwaConfig,
    firebaseConfig: vuefireConfig.config ?? {},
  }
}
