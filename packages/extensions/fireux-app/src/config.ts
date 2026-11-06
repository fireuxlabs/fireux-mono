import EslintModule from '@nuxt/eslint'
import FirebaseModule from 'fireux-core/config/app/firebase'
import type { NuxtConfig } from '@nuxt/schema'
import { configNitroFirebase } from 'fireux-core/config/app/nitro'
import { configPwa } from 'fireux-core/config/app/pwa'
import { setRuntime } from 'fireux-core/config/app/runtime'
import { configViteWorkspace } from 'fireux-core/config/app/vite'
import { createAppDatabaseRuntimeModule } from 'fireux-core/config/app/database'
import { optEnv, reqEnv } from 'fireux-core/config/app/env'
import { defaultNitroFirebaseRegion } from 'fireux-core/config/app/firebase-region'
import { toValidJsIdentifier } from 'fireux-core/config/app/identifier'
import {
  loadFireuxAppMetaContent,
  loadFireuxSolutionsMarkdown,
  mergeFireuxSolutionMarkdownContent,
} from 'fireux-core/config/app/meta-content-loader'
import { moduleName } from 'fireux-core/config/app/modules'
import {
  withDefaultAppLayers,
  withDefaultAppModules,
  DEFAULT_APP_LAYERS,
} from './defaults'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import {
  configureFireuxModuleRestartWatch,
  configureCoreCss,
  configureIconServerBundle,
  configureNitroBaseline,
  configureNuxtRuntimeDefaults,
  configurePageTransition,
  configureProjectPublicAssets,
  configureViewport,
} from 'fireux-core/config/app/nuxt-baseline'
import { normalizeSiteUrl } from 'fireux-core/config/app/seo'
import { resolveSeoConfig } from 'fireux-core/config/app/static-paths'
import type { FireuxAppConfig } from 'fireux-core/config/app/types'
import { validateFireuxAppConfig } from 'fireux-core/config/app/validate'

export type { FireuxAppConfig } from 'fireux-core/config/app/types'

const resolveDependency = createRequire(import.meta.url).resolve

export function defineFireuxApp(input: FireuxAppConfig): NuxtConfig {
  const app = { ...input, modules: withDefaultAppModules(input.modules) }
  validateFireuxAppConfig(app)

  const layers =
    typeof app.extends === 'string' ? [app.extends] : app.extends || []
  const resolvedLayers = withDefaultAppLayers(layers).map((layer) =>
    typeof layer === 'string' &&
    DEFAULT_APP_LAYERS.some((name) => name === layer)
      ? resolveDependency(layer)
      : layer
  )
  const nuxt: NuxtConfig = {
    extends: [...new Set(resolvedLayers)] as NuxtConfig['extends'],
    modulesDir: [
      'node_modules',
      fileURLToPath(new URL('../node_modules', import.meta.url)),
    ],
  }
  const appDatabaseRuntimeModule = createAppDatabaseRuntimeModule(
    app.databaseId
  )

  configureViewport(nuxt)
  configurePageTransition(nuxt)
  configureNitroBaseline(nuxt)
  configureProjectPublicAssets(nuxt)
  configureNuxtRuntimeDefaults(nuxt)
  configureAppModules(nuxt, app, appDatabaseRuntimeModule)
  configureFireuxModuleRestartWatch(nuxt)
  configureIconServerBundle(nuxt)
  configureCoreCss(nuxt)

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
      ...(app.homePath ? { homePath: app.homePath } : {}),
      ...(app.contactEmail ? { contactEmail: app.contactEmail } : {}),
      ...(app.designPacks ? { designPacks: app.designPacks } : {}),
      ...(envDeveloperId ? { developerId: envDeveloperId } : {}),
      domain: envDomain,
      ...(siteUrl ? { siteUrl } : {}),
      role: app.role,
      ecosystem: app.ecosystem,
      projectId: app.projectId,
      ecosystemId: app.ecosystemId,
      modules: moduleNames,
      workspaces: app.workspaces || [],
      workspaceConfig: app.workspaceConfig || {},
      subscriptionCapacity: app.subscriptionCapacity || {},
      domains: app.domains || [],
      profiles: app.profiles || [],
      ...(app.theme ? { theme: app.theme } : {}),
    },

    firebaseApp: {
      ...(envFirebaseApiKey ? { apiKey: envFirebaseApiKey } : {}),
      appId: envFirebaseAppId,
    },

    private: {
      initialAppContext: app.context?.trim() || '',
      ...(resolvedSeo ? { seo: resolvedSeo } : {}),
      ...(metaContent ? { meta: metaContent } : {}),
    },
  })

  configPwa(nuxt, {
    id: app.id,
    name: app.name,
    shortName: app.shortName,
    themeColor: app.theme?.palette.accent || '#000000',
    backgroundColor: app.theme?.palette.canvas || '#000000',
    lang: 'en',
  })

  configNitroFirebase(nuxt, {
    serverFunctionName: toValidJsIdentifier(app.id),
    region:
      process.env.NITRO_FIREBASE_REGION ||
      defaultNitroFirebaseRegion(app.ecosystem),
    secrets: app.firebaseSecrets,
  })

  configViteWorkspace(nuxt)

  return nuxt
}

function configureAppModules(
  nuxt: NuxtConfig,
  app: FireuxAppConfig,
  appDatabaseRuntimeModule: unknown
) {
  nuxt.modules = [
    EslintModule,
    '@nuxt/ui',
    '@nuxt/icon',
    `fireux-${app.ecosystem}`,
    ...(appDatabaseRuntimeModule ? [appDatabaseRuntimeModule] : []),
    [FirebaseModule, { authEnabled: app.authEnabled !== false }],
    'fireux-core',
    '@vite-pwa/nuxt',
    ...(app.modules || []),
  ] as NonNullable<NuxtConfig['modules']>
}
