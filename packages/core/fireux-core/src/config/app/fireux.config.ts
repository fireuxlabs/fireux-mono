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
  configureDashboardPanelDefaults,
  configureCoreCss,
  configureIconServerBundle,
  configureNitroBaseline,
  configureNuxtRuntimeDefaults,
  configurePageTransition,
  configureProjectPublicAssets,
  configureViewport,
} from './nuxt-baseline'
import { normalizeSiteUrl } from './seo'
import { resolveSeoConfig } from './static-paths'
import type { FireuxAppConfig } from './types'
import { validateFireuxAppConfig } from './validate'
import { configureAppDesignPack } from './design-packs'

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
  const appDatabaseRuntimeModule = createAppDatabaseRuntimeModule(
    app.databaseId
  )

  configureViewport(nuxt)
  configurePageTransition(nuxt)
  configureNitroBaseline(nuxt)
  configureProjectPublicAssets(nuxt)
  configureNuxtRuntimeDefaults(nuxt)
  configureAppModules(nuxt, app, appDatabaseRuntimeModule)
  configureIconServerBundle(nuxt)
  configureDashboardPanelDefaults(nuxt)
  configureCoreCss(nuxt)
  configureAppDesignPack(nuxt, app.designPack)

  const envDomain = reqEnv('APP_DOMAIN')
  const siteUrl = normalizeSiteUrl(app.seo?.siteUrl || envDomain)
  const envDeveloperId =
    optEnv('DEVELOPER_ID') ||
    optEnv('DEVELOPER_UID') ||
    optEnv('NUXT_PUBLIC_DEVELOPER_ID')
  const envFirebaseApiKey = optEnv('NUXT_FIREBASE_API_KEY')
  const envFirebaseAppId = reqEnv('NUXT_FIREBASE_APP_ID')
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
      projectId: app.projectId,
      ...(app.ecosystemId ? { ecosystemId: app.ecosystemId } : {}),
      modules: moduleNames,
      consoles: app.consoles || [],
      consoleConfig: app.consoleConfig || {},
      domains: app.domains || [],
      profiles: app.profiles || [],
      selfJoinEnabled: app.selfJoinEnabled === true,
      ...(app.authDefaultMode ? { authDefaultMode: app.authDefaultMode } : {}),
      ...(app.authCompletion ? { authCompletion: app.authCompletion } : {}),
      ...(app.authOnboarding ? { authOnboarding: app.authOnboarding } : {}),
      navHiddenKeys: app.navHiddenKeys || [],
      navOverrides: app.navOverrides || {},
    },

    firebaseApp: {
      ...(envFirebaseApiKey ? { apiKey: envFirebaseApiKey } : {}),
      appId: envFirebaseAppId,
    },

    private: {
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
    region:
      process.env.NITRO_FIREBASE_REGION ||
      defaultNitroFirebaseRegion(app.ecosystem),
  })

  configViteWorkspace(nuxt)

  return nuxt
}
