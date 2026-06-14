// FILE: packages/core/fireux-core/config/app/fireux.config.ts
import type { NuxtConfig } from '@nuxt/schema'
import { configNitroFirebase } from './nitro'
import { configPwa } from './pwa'
import { setRuntime } from './runtime'
import { configViteWorkspace } from './vite'
import { createAppDatabaseRuntimeModule } from './database'
import { optEnv, reqEnv } from './env'
import { defaultNitroFirebaseRegion } from './firebase-region'
import { toValidJsIdentifier } from './identifier'
import {
  loadFireuxAppMetaContent,
  loadFireuxSolutionsMarkdown,
  mergeFireuxSolutionMarkdownContent,
} from './meta-content'
import { moduleName } from './modules'
import {
  configureAppModules,
  configureConsolePanelDefaults,
  configureCoreCss,
  configureIconServerBundle,
  configureNitroBaseline,
  configureNuxtRuntimeDefaults,
  configureProjectPublicAssets,
  configureViewport,
} from './nuxt-baseline'
import { normalizeSiteUrl } from './seo'
import { resolveSeoConfig } from './static-paths'
import type { FireuxAppConfig } from './types'
import { validateFireuxAppConfig } from './validate'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    pwa?: Record<string, any>
    icon?: Record<string, any>
  }
  interface NuxtOptions {
    pwa?: Record<string, any>
    icon?: Record<string, any>
  }
}

export type { FireuxAppConfig } from './types'

export function defineFireuxConfig(app: FireuxAppConfig): NuxtConfig {
  validateFireuxAppConfig(app)

  const nuxt: NuxtConfig = {}
  const appDatabaseRuntimeModule = createAppDatabaseRuntimeModule(app.databaseId)

  configureViewport(nuxt)
  configureNitroBaseline(nuxt)
  configureProjectPublicAssets(nuxt)
  configureNuxtRuntimeDefaults(nuxt)
  configureAppModules(nuxt, app, appDatabaseRuntimeModule)
  configureIconServerBundle(nuxt)
  configureConsolePanelDefaults(nuxt)
  configureCoreCss(nuxt)

  const envDomain = reqEnv('APP_DOMAIN')
  const siteUrl = normalizeSiteUrl(app.seo?.siteUrl || envDomain)
  const envPin = optEnv('DEVELOPER_PIN')
  const envDeveloperId =
    optEnv('DEVELOPER_ID') ||
    optEnv('DEVELOPER_UID') ||
    optEnv('NUXT_PUBLIC_DEVELOPER_ID')
  const envFirebaseApiKey = optEnv('NUXT_FIREBASE_API_KEY')
  const envFirebaseAppId = reqEnv('NUXT_FIREBASE_APP_ID')
  const envFirebaseMeasurementId = optEnv('NUXT_FIREBASE_MEASUREMENT_ID')
  const moduleNames = (nuxt.modules || [])
    .map(moduleName)
    .filter(Boolean) as string[]
  const loadedMetaContent = loadFireuxAppMetaContent(app.meta)
  const metaContent = mergeFireuxSolutionMarkdownContent(
    loadedMetaContent,
    loadFireuxSolutionsMarkdown()
  )
  const resolvedSeo = resolveSeoConfig(app.seo, metaContent)

  setRuntime(nuxt, {
    app: {
      id: app.id,
      name: app.name,
      shortName: app.shortName,
      ...(app.contactEmail ? { contactEmail: app.contactEmail } : {}),
      ...(app.designPack ? { designPack: app.designPack } : {}),
      ...(app.designPacks ? { designPacks: app.designPacks } : {}),
      ...(envDeveloperId ? { developerId: envDeveloperId } : {}),
      domain: envDomain,
      ...(siteUrl ? { siteUrl } : {}),
      role: app.role,
      ecosystem: app.ecosystem,
      modules: moduleNames,
      consoles: app.consoles || [],
      consoleConfig: app.consoleConfig || {},
      domains: app.domains || [],
      profiles: app.profiles || [],
      navHiddenKeys: app.navHiddenKeys || [],
    },

    firebaseApp: {
      ...(envFirebaseApiKey ? { apiKey: envFirebaseApiKey } : {}),
      appId: envFirebaseAppId,
      ...(envFirebaseMeasurementId ? { measurementId: envFirebaseMeasurementId } : {}),
    },

    private: {
      developerPin: envPin,
      ...(resolvedSeo ? { seo: resolvedSeo } : {}),
      ...(metaContent ? { meta: metaContent } : {}),
    },
  })

  configPwa(nuxt, {
    name: app.name,
    shortName: app.shortName,
    themeColor: '#000000',
    backgroundColor: '#000000',
    lang: 'en',
  })

  configNitroFirebase(nuxt, {
    serverFunctionName: toValidJsIdentifier(app.id),
    region: process.env.NITRO_FIREBASE_REGION || defaultNitroFirebaseRegion(app.ecosystem),
  })

  configViteWorkspace(nuxt)

  return nuxt
}
