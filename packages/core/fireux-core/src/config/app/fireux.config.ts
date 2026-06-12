// FILE: packages/core/fireux-core/config/app/fireux.config.ts
import type { NuxtConfig } from '@nuxt/schema'
import { defineNuxtModule } from '@nuxt/kit'
import { createJiti } from 'jiti'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { configNitroFirebase } from './nitro'
import { configPwa } from './pwa'
import { setRuntime, type RuntimeAppRole } from './runtime'
import type { FireuxSeoConfig } from './seo'
import { configViteWorkspace } from './vite'
import { resolveFireuxBrandAssets } from '../../utils/brandAssets'
import type {
  FireuxMetaChecklistItem,
  FireuxMetaContent,
  FireuxMetaSolution,
} from '../../runtime/models/system/meta-content.model'

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

export type FireuxAppConfig = {
  ecosystem: string
  id: string
  name: string
  shortName: string
  /** Optional app-owned Firestore database id. Standalone apps should set this. */
  databaseId?: string
  /** Optional app thumbnail path/URL (role-aware defaults apply when omitted). */
  appThumbnail?: string
  /** Optional app logo path/URL (preferred). Role-aware defaults apply when omitted. */
  appLogo?: string
  /** Optional light logo path/URL for dark backgrounds. */
  appLogoLight?: string
  /** Optional dark logo path/URL for light backgrounds. */
  appLogoDark?: string
  /** Optional public contact/support email shown in shared UI (e.g. footer). */
  contactEmail?: string
  /** Optional app-level design pack. Surface-specific packs belong in designPacks. */
  designPack?: Record<string, unknown>
  /** Optional app-level surface design packs, e.g. designPacks.publicMenu. */
  designPacks?: Record<string, Record<string, unknown>>
  role: RuntimeAppRole
  modules?: NonNullable<NuxtConfig['modules']>
  consoles?: string[]
  /** Optional per-console app behavior, e.g. whether this app may create or pin console targets. */
  consoleConfig?: Record<string, { canCreate?: boolean; targetIds?: string[] }>
  /** Optional public/admin root domains this app consumes. */
  domains?: string[]
  /** Optional profile identities this app lets users create/manage. */
  profiles?: string[]
  /** Optional public/dashboard nav item keys hidden by this app shell. */
  navHiddenKeys?: string[]
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}

function moduleName(entry: unknown): string | undefined {
  if (typeof entry === 'string') return entry
  if (Array.isArray(entry) && typeof entry[0] === 'string') return entry[0]
  return undefined
}

function isValidJsIdentifier(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
}

function toValidJsIdentifier(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'server'
  if (isValidJsIdentifier(trimmed)) return trimmed

  const parts = trimmed
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p.replace(/[^A-Za-z0-9]/g, ''))
    .filter(Boolean)

  let out = parts
    .map((p, i) => {
      const lower = p.toLowerCase()
      if (i === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')

  if (!out) out = 'server'
  if (!/^[A-Za-z_$]/.test(out)) out = `_${out}`
  out = out.replace(/[^A-Za-z0-9_$]/g, '_')

  return out
}

function defaultNitroFirebaseRegion(ecosystem: string): string {
  switch (ecosystem) {
    case 'misebox':
      return 'europe-west6'
    default:
      // FireUX + Cleanbox use Firestore multi-region eur3; eur3 is not a
      // deployable Cloud Functions region, so we default to a nearby region.
      return 'europe-west1'
  }
}

function normalizePublicPath(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function mergeStaticPaths(paths: readonly unknown[]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []

  for (const path of paths) {
    const normalized = normalizePublicPath(path)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    merged.push(normalized)
  }

  return merged
}

function resolveSeoConfig(
  seo: FireuxSeoConfig | undefined,
  meta: FireuxMetaContent | undefined
): FireuxSeoConfig | undefined {
  const solutionPaths = (meta?.solutions || [])
    .map((solution) => normalizePublicPath(`/solutions/${solution.slug}`))
    .filter((path): path is string => Boolean(path))

  if (!solutionPaths.length) return seo

  return {
    ...(seo || {}),
    staticPaths: mergeStaticPaths([
      ...(seo?.staticPaths || []),
      '/solutions',
      ...solutionPaths,
    ]),
  }
}

function reqEnv(name: string): string {
  const value = process.env[name]
  if (typeof value !== 'string' || !value.trim()) {
    const isCi =
      process.env.CI === 'true' ||
      process.env.CI === '1' ||
      process.env.GITHUB_ACTIONS === 'true'
    const isTypecheck = process.argv.some((arg) => arg.includes('typecheck'))

    // During CI (especially on `pnpm install` → `postinstall` → `nuxi prepare`),
    // we don't require full runtime envs yet.
    if (isCi || isTypecheck) {
      if (name === 'APP_DOMAIN') return 'localhost'
      if (name === 'NUXT_FIREBASE_APP_ID') return 'ci'
    }

    throw new Error(`[fireux] Missing required env var: ${name}`)
  }
  return value.trim()
}

function optEnv(name: string): string | undefined {
  const value = process.env[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function validateFireuxAppConfig(app: FireuxAppConfig): void {
  if (app.role === 'standalone' && app.ecosystem !== 'fireux') {
    throw new Error(
      '[fireux] role "standalone" is currently only supported inside the "fireux" ecosystem.'
    )
  }
}

function loadFireuxAppMetaContent(explicitMeta?: FireuxMetaContent): FireuxMetaContent | undefined {
  if (explicitMeta) return explicitMeta

  const appMeta = resolve(process.cwd(), 'app/meta.ts')
  if (!existsSync(appMeta)) {
    throw new Error(`[fireux] Missing required app meta file: ${appMeta}`)
  }

  try {
    const loadTypeScriptModule = createJiti(import.meta.url)
    const loaded = loadTypeScriptModule(appMeta) as { metaContent?: FireuxMetaContent }
    if (!loaded.metaContent) {
      throw new Error(`[fireux] App meta file must export metaContent: ${appMeta}`)
    }
    return loaded.metaContent
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[fireux] Failed to load app meta from ${appMeta}: ${message}`)
  }
}

type FireuxSolutionMarkdownContent = Pick<
  FireuxMetaSolution,
  'body' | 'steps' | 'businessCase' | 'provisioning' | 'checklist'
>

function normalizeSolutionSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeMarkdownBody(lines: string[]): string | undefined {
  const text = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text || undefined
}

function parseFireuxSolutionsMarkdown(markdown: string): Record<string, FireuxSolutionMarkdownContent> {
  const out: Record<string, FireuxSolutionMarkdownContent> = {}
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let slug = ''
  let mode: 'body' | 'steps' | 'businessCase' | 'provisioning' | 'checklist' = 'body'
  let bodyLines: string[] = []
  let steps: string[] = []
  let businessCaseLines: string[] = []
  let provisioning: string[] = []
  let checklist: FireuxMetaChecklistItem[] = []

  const flush = () => {
    if (!slug) return

    const body = normalizeMarkdownBody(bodyLines)
    const businessCase = normalizeMarkdownBody(businessCaseLines)
    out[slug] = {
      ...(body ? { body } : {}),
      ...(steps.length ? { steps } : {}),
      ...(businessCase ? { businessCase } : {}),
      ...(provisioning.length ? { provisioning } : {}),
      ...(checklist.length ? { checklist } : {}),
    }
  }

  for (const line of lines) {
    const solutionHeading = line.match(/^##\s+(.+?)\s*$/)
    if (solutionHeading) {
      flush()
      slug = normalizeSolutionSlug(solutionHeading[1] || '')
      mode = 'body'
      bodyLines = []
      steps = []
      businessCaseLines = []
      provisioning = []
      checklist = []
      continue
    }

    if (!slug) continue

    if (/^###\s+how this comes to life\s*$/i.test(line.trim())) {
      mode = 'steps'
      continue
    }

    if (/^###\s+business case\s*$/i.test(line.trim())) {
      mode = 'businessCase'
      continue
    }

    if (/^###\s+provisioning\s*$/i.test(line.trim())) {
      mode = 'provisioning'
      continue
    }

    if (/^###\s+checklist\s*$/i.test(line.trim())) {
      mode = 'checklist'
      continue
    }

    if (mode === 'steps') {
      const step = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+?)\s*$/)
      if (step?.[1]) steps.push(step[1].trim())
      continue
    }

    if (mode === 'businessCase') {
      businessCaseLines.push(line)
      continue
    }

    if (mode === 'provisioning' || mode === 'checklist') {
      const item = line.match(/^\s*(?:[-*]|\d+\.)\s+(?:\[( |x|X)\]\s*)?(.+?)\s*$/)
      if (item?.[2]) {
        const label = (item[2] || '').trim()
        if (!label) continue
        if (mode === 'provisioning') provisioning.push(label)
        else checklist.push({ label, done: item[1].toLowerCase() === 'x' })
      }
      continue
    }

    bodyLines.push(line)
  }

  flush()

  return out
}

function loadFireuxSolutionsMarkdown(): Record<string, FireuxSolutionMarkdownContent> {
  const solutionContentPath = resolve(process.cwd(), 'app/solutions.md')
  if (!existsSync(solutionContentPath)) return {}

  return parseFireuxSolutionsMarkdown(readFileSync(solutionContentPath, 'utf8'))
}

function mergeFireuxSolutionMarkdownContent(
  meta: FireuxMetaContent | undefined,
  content: Record<string, FireuxSolutionMarkdownContent>
): FireuxMetaContent | undefined {
  if (!meta?.solutions?.length || !Object.keys(content).length) return meta

  return {
    ...meta,
    solutions: meta.solutions.map((solution) => {
      const markdown = content[solution.slug]
      if (!markdown) return solution

      return {
        ...solution,
        ...(markdown.body ? { body: markdown.body } : {}),
        ...(markdown.steps?.length ? { steps: markdown.steps } : {}),
        ...(markdown.businessCase ? { businessCase: markdown.businessCase } : {}),
        ...(markdown.provisioning?.length ? { provisioning: markdown.provisioning } : {}),
        ...(markdown.checklist?.length ? { checklist: markdown.checklist } : {}),
      }
    }),
  }
}

function createAppDatabaseRuntimeModule(databaseId?: string) {
  const resolvedDatabaseId = typeof databaseId === 'string' ? databaseId.trim() : ''
  if (!resolvedDatabaseId) return null

  return defineNuxtModule({
    meta: {
      name: 'fireux-app-database-runtime',
    },
    setup(_options, nuxt) {
      const runtime = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
      const pub = ((runtime.public ||= {}) as Record<string, any>)
      const ecosystem = ((pub.firebaseEcosystem ||= {}) as Record<string, any>)
      const firebase = ((ecosystem.firebase ||= {}) as Record<string, any>)
      firebase.identityDatabaseId ||= firebase.databaseId || resolvedDatabaseId
      firebase.databaseId = resolvedDatabaseId
    },
  })
}

export function defineFireuxConfig(app: FireuxAppConfig): NuxtConfig {
  validateFireuxAppConfig(app)

  const nuxt: NuxtConfig = {}
  const appDatabaseRuntimeModule = createAppDatabaseRuntimeModule(app.databaseId)
  const brandAssets = resolveFireuxBrandAssets({
    role: app.role,
    appLogo: app.appLogo,
    appLogoLight: app.appLogoLight,
    appLogoDark: app.appLogoDark,
    appThumbnail: app.appThumbnail,
  })

  // Ensure responsive breakpoints behave correctly on mobile.
  // Without an explicit viewport meta tag, browsers may render using a
  // desktop-sized viewport (making the console sidebar appear "always on").
  const head: any = ((nuxt as any).app ||= {}).head ||= {}
  const meta: any[] = (head.meta ||= [])
  const hasViewport = meta.some((m) => m?.name === 'viewport')
  if (!hasViewport) {
    meta.push({ name: 'viewport', content: 'width=device-width, initial-scale=1' })
  }

  // Align Nitro defaults with our current baseline.
  // Prevents runtime fallback warnings during dev.
  ;(nuxt as any).compatibilityDate = '2025-12-22'
  const nuxtWithNitro = nuxt as NuxtConfig & { nitro?: Record<string, any> }
  nuxtWithNitro.nitro = {
    ...(nuxtWithNitro.nitro || {}),
    compatibilityDate: '2025-12-22',
  }
  const projectPublicDir = resolve(process.cwd(), 'public')
  if (existsSync(projectPublicDir)) {
    const publicAssets = ((nuxtWithNitro.nitro as any).publicAssets ||= []) as Array<
      string | { dir: string; maxAge?: number; baseURL?: string }
    >
    const already = publicAssets.some((entry) =>
      typeof entry === 'string'
        ? entry === projectPublicDir
        : entry?.dir === projectPublicDir
    )
    if (!already) publicAssets.push({ dir: projectPublicDir })
  }
  nuxt.experimental = {
    ...(nuxt.experimental || {}),
    // Avoid stale dev client requests to /_nuxt/builds/meta/dev.json.
    appManifest: process.env.NODE_ENV === 'production',
    // Enables compile-time route meta extraction from definePageMeta.
    scanPageMeta: true,
  }

  nuxt.srcDir = 'app'
  // Keep one generated output location for both `nuxi prepare` and `nuxi dev`.
  // We keep it under /app so project-app guards do not delete the live dev
  // output at the repo root during save/push flows.
  nuxt.buildDir = 'app/.nuxt'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }

  nuxt.modules = [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/icon',
    `fireux-${app.ecosystem}`,
    ...(appDatabaseRuntimeModule ? [appDatabaseRuntimeModule] : []),
    // VueFire/Firebase wiring lives in fireux-nuxtfire.
    'fireux-nuxtfire',
    'fireux-core',
    ...(app.role === 'global' ? ['fireux-ecosystem-controller'] : []),
    '@vite-pwa/nuxt',
    ...(app.modules || []),
  ]

  // Keep icon resolution consistent across all Firebase/Cloud Run deployments.
  // This avoids app-level drift where only some apps force remote icon bundles.
  ;(nuxt as any).icon = {
    ...((nuxt as any).icon || {}),
    serverBundle: 'remote',
  }

  // FireUX baseline for console page body spacing.
  // App-level app.config.ts can still override this when needed.
  const appConfig = (((nuxt as any).appConfig ||= {}) as Record<string, any>)
  const uiConfig = ((appConfig.ui ||= {}) as Record<string, any>)
  const consolePanel = ((uiConfig.consolePanel ||= {}) as Record<string, any>)
  const slots = ((consolePanel.slots ||= {}) as Record<string, any>)
  slots.body ||= 'px-2 sm:px-4'



  nuxt.css = [
    'fireux-core/runtime/assets/styles/main.css',
    'fireux-core/runtime/assets/styles/main.scss',
  ]

  const envDomain = reqEnv('APP_DOMAIN')
  const envPin = optEnv('DEVELOPER_PIN')
  const envDeveloperId =
    optEnv('DEVELOPER_ID') ||
    optEnv('DEVELOPER_UID') ||
    optEnv('NUXT_PUBLIC_DEVELOPER_ID')
  const envFirebaseApiKey = optEnv('NUXT_FIREBASE_API_KEY')
  const envFirebaseAppId = reqEnv('NUXT_FIREBASE_APP_ID')
  const envFirebaseMeasurementId = optEnv('NUXT_FIREBASE_MEASUREMENT_ID')
  const envPlacesApiKey =
    optEnv('GOOGLE_PLACES_API_KEY') ||
    optEnv('NUXT_GOOGLE_PLACES_API_KEY') ||
    optEnv('NUXT_PUBLIC_GOOGLE_PLACES_API_KEY')
  const moduleNames = (nuxt.modules || [])
    .map(moduleName)
    .filter(Boolean) as string[]
  const loadedMetaContent = loadFireuxAppMetaContent(app.meta)
  const metaContent = mergeFireuxSolutionMarkdownContent(
    loadedMetaContent,
    loadFireuxSolutionsMarkdown()
  )
  const resolvedSeo = resolveSeoConfig(app.seo, metaContent)

  if (envPlacesApiKey) {
    const rc = ((nuxt as any).runtimeConfig ||= {}) as Record<string, any>
    const pub = (rc.public ||= {}) as Record<string, any>
    rc.googlePlacesApiKey ||= envPlacesApiKey
    pub.googlePlacesApiKey ||= envPlacesApiKey
  }
  setRuntime(nuxt, {
    app: {
      id: app.id,
      name: app.name,
      shortName: app.shortName,
      appThumbnail: brandAssets.thumbnail,
      appLogo: brandAssets.logo,
      appLogoLight: brandAssets.logoLight,
      appLogoDark: brandAssets.logoDark,
      ...(app.contactEmail ? { contactEmail: app.contactEmail } : {}),
      ...(app.designPack ? { designPack: app.designPack } : {}),
      ...(app.designPacks ? { designPacks: app.designPacks } : {}),
      ...(envDeveloperId ? { developerId: envDeveloperId } : {}),
      domain: envDomain,
      ...(app.seo?.siteUrl ? { siteUrl: app.seo.siteUrl } : {}),
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
    role: app.role,
  })

  configNitroFirebase(nuxt, {
    serverFunctionName: toValidJsIdentifier(app.id),
    region: process.env.NITRO_FIREBASE_REGION || defaultNitroFirebaseRegion(app.ecosystem),
  })

  configViteWorkspace(nuxt)

  return nuxt
}
