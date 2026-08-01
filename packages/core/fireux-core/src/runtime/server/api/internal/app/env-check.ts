// FILE: packages/core/fireux-core/src/runtime/server/api/internal/app/env-check.ts
// Concurrent edit — 2026-07-20 16:35 CEST — Repo Efficiency Pass 1 of 6: authenticate and prevent caching of environment diagnostics.
import { useAppConfig, useRuntimeConfig } from '#imports'
import { timingSafeEqual } from 'node:crypto'
import {
  createError,
  defineEventHandler,
  getHeader,
  setHeader,
  type H3Event,
} from 'h3'
import {
  join,
  isAbsolute,
  relative,
  dirname,
} from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { requireDevDeveloper } from '../../../utils/auth/developer'
import {
  checkCurrentAppBrandAssets,
  findRepoRoot,
  type BrandAssetCheck,
} from './env-check-assets'

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

async function assertDevOrInternalAccess(event: H3Event) {
  if (import.meta.dev) {
    await requireDevDeveloper(event)
    return
  }

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
  /** Explicit credential env detected; standard ADC is not probed here. */
  configured: boolean
}
const hasText = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0

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

export default defineEventHandler(async (event: H3Event): Promise<EnvCheckResponse> => {
  await assertDevOrInternalAccess(event)
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')

  const env = process.env as Record<string, string | undefined>
  const runtimeConfig = useRuntimeConfig(event)
  const appConfig = useAppConfig() as Record<string, any>
  const publicRuntime = (runtimeConfig?.public ?? {}) as Record<string, any>
  const fireux = (publicRuntime.fireux ?? {}) as Record<string, any>
  const firebaseEcosystem = (publicRuntime.firebaseEcosystem?.firebase ?? {}) as Record<
    string,
    any
  >
  const firebaseApp = (publicRuntime.firebaseApp ?? {}) as Record<string, any>
  const appConfigColors = (appConfig?.ui?.colors ?? {}) as Record<string, any>
  const here = dirname(fileURLToPath(import.meta.url))
  const repoRoot = findRepoRoot(here)

  const requiredClient = [
    {
      key: 'firebaseEcosystem.apiKey',
      present: hasText(firebaseEcosystem.apiKey),
    },
    {
      key: 'firebaseEcosystem.authDomain',
      present: hasText(firebaseEcosystem.authDomain),
    },
    {
      key: 'firebaseEcosystem.projectId',
      present: hasText(firebaseEcosystem.projectId),
    },
    {
      key: 'firebaseEcosystem.storageBucket',
      present: hasText(firebaseEcosystem.storageBucket),
    },
    {
      key: 'firebaseEcosystem.messagingSenderId',
      present: hasText(firebaseEcosystem.messagingSenderId),
    },
    {
      key: 'firebaseApp.appId',
      present: hasText(firebaseApp.appId),
    },
    {
      key: 'fireux.id',
      present: hasText(fireux.id),
    },
    {
      key: 'fireux.name',
      present: hasText(fireux.name),
    },
    {
      key: 'fireux.shortName',
      present: hasText(fireux.shortName),
    },
    {
      key: 'fireux.domain',
      present: hasText(fireux.domain),
    },
  ]

  const optionalClient = [
    {
      key: 'firebaseApp.measurementId',
      present: hasText(firebaseApp.measurementId),
    },
    {
      key: 'fireux.primaryColor',
      present:
        hasText(fireux.primaryColor) ||
        hasText(publicRuntime.primaryColor) ||
        hasText(appConfigColors.primary),
    },
    {
      key: 'fireux.neutralColor',
      present:
        hasText(fireux.neutralColor) ||
        hasText(publicRuntime.neutralColor) ||
        hasText(appConfigColors.neutral),
    },
    {
      key: 'fireux.secondaryColor',
      present:
        hasText(fireux.secondaryColor) ||
        hasText(publicRuntime.secondaryColor) ||
        hasText(appConfigColors.secondary),
    },
  ]

  // Detect explicit Admin credential configuration only. Standard ADC can be
  // available without env vars and is resolved when the Admin SDK initializes.
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

  const explicitAdminAuthConfigured =
    serverAuthJson || serverAuthSplit || serverAuthFile

  // Compute presence
  const missingRequired = requiredClient
    .filter((entry) => !entry.present)
    .map((entry) => entry.key)
  const presentOptionalClient = optionalClient.filter((entry) => entry.present)

  const brandAssets = checkCurrentAppBrandAssets()

  const passedBrandCount = brandAssets.filter((b) => b.ok).length

  // Build warnings
  const warnings: string[] = []
  if (!explicitAdminAuthConfigured) {
    warnings.push(
      'No explicit Firebase Admin credential env was detected. Standard ADC is not probed by this check and may still initialize Admin at runtime.'
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
    passedBrandCount === brandAssets.length

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
        configured: explicitAdminAuthConfigured,
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
      'Brand asset validation checks this app only: public/img/app/. Shared core or ecosystem assets do not count.',
      ...(detectedServiceAccountPath
        ? [`Explicit credential file detected at ${detectedServiceAccountPath}.`]
        : [
            'Admin SDK detection checks only explicit credential env vars. Standard ADC may exist without env vars and is resolved only when the Admin SDK initializes.',
          ]),
    ],

    brandAssets,
  }
})
