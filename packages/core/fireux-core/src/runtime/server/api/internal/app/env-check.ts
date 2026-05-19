// FILE: packages/core/fireux-core/src/runtime/server/api/internal/app/env-check.ts
import { useAppConfig, useRuntimeConfig } from '#imports'
import { timingSafeEqual } from 'node:crypto'
import { createError, defineEventHandler, getHeader, type H3Event } from 'h3'
import {
  join,
  isAbsolute,
  relative,
  resolve as pathResolve,
  dirname,
} from 'node:path'
import { existsSync, readFileSync, statSync } from 'node:fs'
import imageSize from 'image-size'
import { fileURLToPath } from 'node:url'
import {
  APP_PUBLIC_ASSET_REQUIREMENTS,
  validateAppAssetDimensions,
  type AppAssetDimensionConstraints,
} from '../../../../composables/fireux/firestore/core/app/utils/appMedia'

type ISizeCalculationResult = ReturnType<typeof imageSize>

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function safeEquals(value: string, expected: string): boolean {
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function serviceKeyFromRequest(event: H3Event): string {
  const authorization = firstString(getHeader(event, 'authorization'))
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  return firstString(
    getHeader(event, 'x-fireux-core-service-key'),
    getHeader(event, 'x-fireux-internal-key'),
    bearer
  )
}

function configuredServiceKey(event: H3Event): string {
  const runtime = useRuntimeConfig(event) as any
  const fireuxCore = runtime?.fireuxCore || {}
  const fireux = runtime?.fireux || {}
  return firstString(
    process.env.FIREUX_CORE_SERVICE_KEY,
    process.env.FIREUX_INTERNAL_API_KEY,
    fireuxCore.serviceKey,
    fireuxCore.internalApiKey,
    fireux.serviceKey,
    fireux.internalApiKey
  )
}

function assertDevOrInternalAccess(event: H3Event) {
  if (import.meta.dev) return

  const serviceKey = configuredServiceKey(event)
  if (!serviceKey) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  if (!safeEquals(serviceKeyFromRequest(event), serviceKey)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized FireUX internal request.',
    })
  }
}

/** Typed shape consumed by the client */
interface EnvVarEntry {
  key: string
  present: boolean
  value?: string
}
interface AdminAuthStatus {
  json: boolean
  splitKeys: {
    FIREBASE_PROJECT_ID: boolean
    FIREBASE_CLIENT_EMAIL: boolean
    FIREBASE_PRIVATE_KEY: boolean
  }
  file: boolean
  configured: boolean
}
interface BrandAssetCheck {
  name: string
  path: string
  ok: boolean
  reason?: string
  width?: number
  height?: number
}

function findRepoRoot(start: string): string {
  let current = start

  for (let i = 0; i < 10; i += 1) {
    if (
      existsSync(join(current, 'pnpm-workspace.yaml')) ||
      existsSync(join(current, '.git'))
    ) {
      return current
    }

    const parent = pathResolve(current, '..')
    if (parent === current) break
    current = parent
  }

  return current
}

function validateBrandDimensions(
  name: string,
  dim: ISizeCalculationResult,
  constraints: AppAssetDimensionConstraints
): string | null {
  return validateAppAssetDimensions(
    name,
    {
      width: dim.width,
      height: dim.height,
      type: dim.type,
    },
    constraints
  )
}

/**
 * Utility: check if brand image exists and meets expected dimensions.
 */
function checkBrandImage(
  name: string,
  relativePath: string,
  resolveAssetPath: (relative: string) => string | null,
  constraints: AppAssetDimensionConstraints
): BrandAssetCheck {
  const absPath = resolveAssetPath(relativePath)
  const result: BrandAssetCheck = { name, path: relativePath, ok: false }

  if (!absPath || !existsSync(absPath)) {
    result.reason = `Missing file: /public/${relativePath}`
    return result
  }

  const stat = statSync(absPath)
  if (!stat.isFile()) {
    result.reason = `Invalid asset path: /public/${relativePath} is not a file`
    return result
  }

  if (stat.size <= 0) {
    result.reason = `Empty file: /public/${relativePath}`
    return result
  }

  let dim: ISizeCalculationResult
  try {
    const buf = readFileSync(absPath)
    dim = imageSize(buf)
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : 'Unable to read image metadata'
    result.reason = `Invalid image file: ${message}`
    return result
  }

  result.width = dim.width
  result.height = dim.height

  const validationError = validateBrandDimensions(name, dim, constraints)

  if (validationError) {
    result.reason = validationError
  } else {
    result.ok = true
  }

  return result
}

function appAssetCheckName(relativePath: string): string {
  return relativePath
    .replace(/^img\/app\//, '')
    .replace(/\.(?:ico|png)$/i, '')
    .replace(/\//g, '-')
}

function createBrandAssetResolver(
  repoRoot: string,
  ecosystem?: string,
  appNamespace?: string
) {
  const candidates = new Set<string>()
  candidates.add(join(process.cwd(), 'public'))
  candidates.add(join(repoRoot, 'public'))
  candidates.add(
    join(
      repoRoot,
      'packages',
      'core',
      'fireux-core',
      'src',
      'runtime',
      'public'
    )
  )

  const scoped = (ecosystem || '').trim()
  if (scoped) {
    candidates.add(
      join(
        repoRoot,
        'packages',
        'ecosystem',
        `fireux-${scoped}`,
        'src',
        'runtime',
        'public'
      )
    )
    candidates.add(
      join(repoRoot, 'projects', scoped, `${scoped}-app`, 'public')
    )
  }

  const appScoped = (appNamespace || '').trim()
  if (appScoped) {
    candidates.add(
      join(repoRoot, 'projects', appScoped, `${appScoped}`, 'public')
    )
    candidates.add(
      join(repoRoot, 'projects', appScoped, `${appScoped}-app`, 'public')
    )
    candidates.add(join(repoRoot, 'packages', 'apps', appScoped, 'public'))
  }

  return (relativePath: string) => {
    for (const base of candidates) {
      const fullPath = join(base, relativePath)
      if (existsSync(fullPath)) {
        return fullPath
      }
    }
    return null
  }
}

/**
 * NOTE:
 * - `role` is enforced via Nuxt config, not env; we do NOT check it here.
 * - This route only validates process.env presence/shape and brand asset existence.
 */
interface EnvCheckResponse {
  isValid: boolean
  required: EnvVarEntry[]
  optionalClient: EnvVarEntry[]
  server: {
    adminAuth: AdminAuthStatus
  }
  missingRequired: string[]
  summary: {
    required: string
    optionalClient: string
    brandAssets: string
  }
  warnings: string[]
  notes: string[]
  brandAssets: BrandAssetCheck[]
}

export default defineEventHandler<EnvCheckResponse>((event: H3Event) => {
  assertDevOrInternalAccess(event)

  const env = process.env as Record<string, string | undefined>
  const runtimeConfig = useRuntimeConfig()
  const appConfig = useAppConfig() as Record<string, any>
  const publicRuntime = (runtimeConfig?.public ?? {}) as Record<string, any>
  const fireux = (publicRuntime.fireux ?? {}) as Record<string, any>
  const firebaseEcosystem = (publicRuntime.firebaseEcosystem?.firebase ?? {}) as Record<
    string,
    any
  >
  const firebaseApp = (publicRuntime.firebaseApp ?? {}) as Record<string, any>
  const appConfigColors = (appConfig?.ui?.colors ?? {}) as Record<string, any>
  const ecosystem = fireux.ecosystem as string | undefined
  const appNamespace =
    (typeof fireux.id === 'string' ? fireux.id.trim() : '') ||
    env.APP_ID?.trim()
  const here = dirname(fileURLToPath(import.meta.url))
  const repoRoot = findRepoRoot(here)

  const requiredClient = [
    {
      key: 'firebaseEcosystem.apiKey',
      present: !!String(firebaseEcosystem.apiKey || '').trim(),
    },
    {
      key: 'firebaseEcosystem.authDomain',
      present: !!String(firebaseEcosystem.authDomain || '').trim(),
    },
    {
      key: 'firebaseEcosystem.projectId',
      present: !!String(firebaseEcosystem.projectId || '').trim(),
    },
    {
      key: 'firebaseEcosystem.storageBucket',
      present: !!String(firebaseEcosystem.storageBucket || '').trim(),
    },
    {
      key: 'firebaseEcosystem.messagingSenderId',
      present: !!String(firebaseEcosystem.messagingSenderId || '').trim(),
    },
    {
      key: 'firebaseApp.appId',
      present: !!String(firebaseApp.appId || '').trim(),
    },
    {
      key: 'fireux.id',
      present: !!String(fireux.id || '').trim(),
    },
    {
      key: 'fireux.name',
      present: !!String(fireux.name || '').trim(),
    },
    {
      key: 'fireux.shortName',
      present: !!String(fireux.shortName || '').trim(),
    },
    {
      key: 'fireux.domain',
      present: !!String(fireux.domain || '').trim(),
    },
  ]

  const optionalClient = [
    {
      key: 'firebaseApp.measurementId',
      present: !!String(firebaseApp.measurementId || '').trim(),
    },
    {
      key: 'fireux.primaryColor',
      present:
        !!String(fireux.primaryColor || '').trim() ||
        !!String(publicRuntime.primaryColor || '').trim() ||
        !!String(appConfigColors.primary || '').trim(),
    },
    {
      key: 'fireux.neutralColor',
      present:
        !!String(fireux.neutralColor || '').trim() ||
        !!String(publicRuntime.neutralColor || '').trim() ||
        !!String(appConfigColors.neutral || '').trim(),
    },
    {
      key: 'fireux.secondaryColor',
      present:
        !!String(fireux.secondaryColor || '').trim() ||
        !!String(publicRuntime.secondaryColor || '').trim() ||
        !!String(appConfigColors.secondary || '').trim(),
    },
  ]

  // Admin auth detection (either JSON blob or split keys)
  const serverAuthJson = !!env.FIREBASE_SERVICE_ACCOUNT
  const serverAuthSplit =
    !!env.FIREBASE_PROJECT_ID &&
    !!env.FIREBASE_CLIENT_EMAIL &&
    !!env.FIREBASE_PRIVATE_KEY
  const serviceAccountPaths = new Set<string>()
  if (env.FIREBASE_SERVICE_ACCOUNT_FILE) {
    serviceAccountPaths.add(env.FIREBASE_SERVICE_ACCOUNT_FILE)
  }
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    serviceAccountPaths.add(env.GOOGLE_APPLICATION_CREDENTIALS)
  }
  if (ecosystem) {
    serviceAccountPaths.add(
      join(
        repoRoot,
        'packages',
        'ecosystem',
        `fireux-${ecosystem}`,
        'src',
        'config',
        'firebase',
        'service-account.json'
      )
    )
    serviceAccountPaths.add(
      join(
        repoRoot,
        'packages',
        'ecosystem',
        ecosystem,
        'src',
        'config',
        'firebase',
        'service-account.json'
      )
    )
    serviceAccountPaths.add(
      join(
        repoRoot,
        'packages',
        'tenants',
        `fireux-${ecosystem}`,
        'config',
        'service-account.json'
      )
    )
    serviceAccountPaths.add(
      join(
        repoRoot,
        'packages',
        'tenants',
        ecosystem,
        'config',
        'service-account.json'
      )
    )
    serviceAccountPaths.add(
      join(
        repoRoot,
        'projects',
        ecosystem,
        `${ecosystem}-app`,
        'config',
        'service-account.json'
      )
    )
    serviceAccountPaths.add(
      join(
        repoRoot,
        'projects',
        ecosystem,
        `fireux-${ecosystem}-app`,
        'config',
        'service-account.json'
      )
    )
  }
  let detectedServiceAccountPath: string | undefined
  const serverAuthFile = Array.from(serviceAccountPaths).some((candidate) => {
    if (!candidate) return false
    const possibilities = isAbsolute(candidate)
      ? [candidate]
      : [candidate, join(repoRoot, candidate)]

    for (const possible of possibilities) {
      if (existsSync(possible)) {
        if (!detectedServiceAccountPath) {
          const relativePath = relative(repoRoot, possible)
          detectedServiceAccountPath = relativePath || possible
        }
        return true
      }
    }

    return false
  })

  const serverAuthConfigured =
    serverAuthJson || serverAuthSplit || serverAuthFile

  // Compute presence
  const missingRequired = requiredClient
    .filter((entry) => !entry.present)
    .map((entry) => entry.key)
  const presentOptionalClient = optionalClient.filter((entry) => entry.present)

  // Brand asset checks
  const resolveBrandAsset = createBrandAssetResolver(
    repoRoot,
    ecosystem,
    appNamespace
  )
  const brandNamespace = (appNamespace || ecosystem || 'fireux').trim()
  const brandRequirements: Array<{
    name: string
    path: string
    dimensions: AppAssetDimensionConstraints
  }> =
    brandNamespace === 'fireux'
      ? [
          {
            name: 'logo',
            path: 'img/core/brand/logo.png',
            dimensions: {
              requiredWidth: 512,
              requiredHeight: 512,
              acceptedTypes: ['png'],
            },
          },
          {
            name: 'wordmark-light',
            path: 'img/core/brand/wordmark-light.png',
            dimensions: {
              minWidth: 256,
              minHeight: 64,
              minAspect: 3,
              acceptedTypes: ['png'],
            },
          },
          {
            name: 'wordmark-dark',
            path: 'img/core/brand/wordmark-dark.png',
            dimensions: {
              minWidth: 256,
              minHeight: 64,
              minAspect: 3,
              acceptedTypes: ['png'],
            },
          },
        ]
      : APP_PUBLIC_ASSET_REQUIREMENTS.map((asset) => ({
          name: appAssetCheckName(asset.localRelativePath),
          path: asset.localRelativePath,
          dimensions: asset.dimensions,
        }))

  // Check brand assets at the app-level paths only (public/img/app/*) to match figma-export guidance.
  const brandAssets: BrandAssetCheck[] = brandRequirements.map((asset) =>
    checkBrandImage(
      asset.name,
      asset.path,
      resolveBrandAsset,
      asset.dimensions
    )
  )

  const passedBrandCount = brandAssets.filter((b) => b.ok).length

  // Build warnings
  const warnings: string[] = []
  if (!serverAuthConfigured) {
    warnings.push(
      'Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT, split keys, or ecosystem service-account file). SSR/admin features will be limited.'
    )
  }
  // Stripe warnings removed for core onboarding; handled in products module.

  // Helpers to render masked entries
  const mask = (entry: EnvVarEntry): EnvVarEntry => ({
    key: entry.key,
    present: entry.present,
    value: entry.present ? '***' : undefined,
  })

  const isValid =
    missingRequired.length === 0 &&
    passedBrandCount === brandAssets.length &&
    serverAuthConfigured

  return {
    isValid,

    required: requiredClient.map(mask),
    optionalClient: optionalClient.map(mask),

    server: {
      adminAuth: {
        json: serverAuthJson,
        splitKeys: {
          FIREBASE_PROJECT_ID: !!env.FIREBASE_PROJECT_ID,
          FIREBASE_CLIENT_EMAIL: !!env.FIREBASE_CLIENT_EMAIL,
          FIREBASE_PRIVATE_KEY: !!env.FIREBASE_PRIVATE_KEY,
        },
        file: serverAuthFile,
        configured: serverAuthConfigured,
      },
    },

    missingRequired,

    summary: {
      required: `${requiredClient.length - missingRequired.length}/${
        requiredClient.length
      }`,
      optionalClient: `${presentOptionalClient.length}/${optionalClient.length}`,
      brandAssets: `${passedBrandCount}/${brandAssets.length}`,
    },

    warnings,

    notes: [
      'Role is enforced by Nuxt config (createFireuxConfig) and is not checked here.',
      'Runtime config and env values are fixed and non-editable via UI.',
      brandNamespace === 'fireux'
        ? 'Brand asset validation checks /img/core/brand/ for required files and dimensions.'
        : 'Brand asset validation checks /img/app/ for required files and dimensions.',
      ...(detectedServiceAccountPath
        ? [`Service account file detected at ${detectedServiceAccountPath}.`]
        : [
            'Admin SDK detection checks FIREBASE_SERVICE_ACCOUNT(_FILE), legacy project paths, or packages/ecosystem/fireux-<ecosystem>/src/config/firebase/service-account.json.',
          ]),
    ],

    brandAssets,
  }
})
