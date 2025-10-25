// FILE: packages/core/fireux-core/src/runtime/server/api/app/env-check.ts
import { defineEventHandler } from 'h3'
import {
  join,
  isAbsolute,
  relative,
  resolve as pathResolve,
  dirname,
} from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import imageSize from 'image-size'
import { useRuntimeConfig } from '#imports'
import { fileURLToPath } from 'node:url'

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

interface BrandConstraints {
  requiredWidth?: number
  requiredHeight?: number
  minWidth?: number
  minHeight?: number
  minAspect?: number
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
  dim: imageSize.ImageInfo,
  constraints: BrandConstraints
): string | null {
  const type = dim.type
  if (!type) return 'Unknown file type'

  const isSvg = type === 'svg'
  const isPng = type === 'png'

  if (name === 'wordmark' && isSvg) return null

  if (!isSvg && !isPng) return 'Must be SVG or PNG'

  if (name === 'avatar' || name === 'logo') {
    const { requiredWidth, requiredHeight } = constraints
    if (!requiredWidth || !requiredHeight) return null
    if (dim.width === requiredWidth && dim.height === requiredHeight)
      return null
    return `Must be exactly ${requiredWidth}×${requiredHeight} (got ${dim.width}×${dim.height})`
  }

  if (name === 'wordmark') {
    const minWidth = constraints.minWidth ?? 256
    const minHeight = constraints.minHeight ?? 64
    const minAspect = constraints.minAspect ?? 3
    const width = dim.width ?? 0
    const height = dim.height ?? 0
    if (
      width >= minWidth &&
      height >= minHeight &&
      height > 0 &&
      width / height >= minAspect
    ) {
      return null
    }
    return `Must be ≥${minWidth}×${minHeight} with aspect ≥${minAspect}:1 (got ${width}×${height})`
  }

  return null
}

/**
 * Utility: check if brand image exists and meets expected dimensions.
 */
function checkBrandImage(
  name: string,
  relativePath: string,
  requiredWidth?: number,
  requiredHeight?: number,
  minWidth?: number,
  minHeight?: number,
  minAspect?: number
): BrandAssetCheck {
  const absPath = join(process.cwd(), 'public', relativePath)
  const result: BrandAssetCheck = { name, path: relativePath, ok: false }

  if (!existsSync(absPath)) {
    result.reason = `Missing file: /public/${relativePath}`
    return result
  }

  const buf = readFileSync(absPath)
  const dim = imageSize(buf)
  result.width = dim.width
  result.height = dim.height

  const validationError = validateBrandDimensions(name, dim, {
    requiredWidth,
    requiredHeight,
    minWidth,
    minHeight,
    minAspect,
  })

  if (validationError) {
    result.reason = validationError
  } else {
    result.ok = true
  }

  return result
}

/**
 * NOTE:
 * - `role` is enforced via Nuxt config (createFireuxConfig), not env; we do NOT check it here.
 * - This route only validates process.env presence/shape and brand asset existence.
 */
export default defineEventHandler<EnvCheckResponse>((event) => {
  const env = process.env as Record<string, string | undefined>
  const runtimeConfig = useRuntimeConfig(event)
  const ecosystem = runtimeConfig.public?.ecosystem as string | undefined
  const here = dirname(fileURLToPath(import.meta.url))
  const repoRoot = findRepoRoot(here)

  const requiredClient = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'APP_ID',
    'APP_NAME',
    'APP_SHORT_NAME',
    'APP_PRIMARY_COLOR',
    'APP_NEUTRAL_COLOR',
    'APP_ICON',
    'APP_DOMAIN',
  ]

  const optionalClient = [
    'FIREBASE_MEASUREMENT_ID',
    'FIREBASE_RECAPTCHA_V3_KEY',
    'GOOGLE_PLACES_API_KEY',
  ]

  const optionalServer = [
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
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
  if (ecosystem) {
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
  const missingRequired = requiredClient.filter((k) => !env[k])
  const presentOptionalClient = optionalClient.filter((k) => !!env[k])
  const presentOptionalServer = optionalServer.filter((k) => !!env[k])

  // Brand asset checks
  const brandAssets: BrandAssetCheck[] = [
    checkBrandImage('avatar', 'img/brand/avatar.png', 512, 512),
    checkBrandImage('logo', 'img/brand/logo.png', 512, 512),
    checkBrandImage(
      'wordmark',
      'img/brand/wordmark.png',
      undefined,
      undefined,
      256,
      64,
      3
    ),
  ]

  const passedBrandCount = brandAssets.filter((b) => b.ok).length

  // Build warnings
  const warnings: string[] = []
  if (!serverAuthConfigured) {
    warnings.push(
      'Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT or split keys). SSR/admin features will be limited.'
    )
  }
  if (env.STRIPE_SECRET_KEY && !env.STRIPE_WEBHOOK_SECRET) {
    warnings.push(
      'STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing. Webhook validation will be disabled.'
    )
  }

  // Helpers to render masked entries
  const mask = (k: string): EnvVarEntry => ({
    key: k,
    present: !!env[k],
    value: env[k] ? '***' : undefined,
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
      optional: optionalServer.map(mask),
    },

    missingRequired,

    summary: {
      required: `${requiredClient.length - missingRequired.length}/${
        requiredClient.length
      }`,
      optionalClient: `${presentOptionalClient.length}/${optionalClient.length}`,
      optionalServer: `${presentOptionalServer.length}/${optionalServer.length}`,
      brandAssets: `${passedBrandCount}/${brandAssets.length}`,
    },

    warnings,

    notes: [
      'Role is enforced by Nuxt config (createFireuxConfig) and is not checked here.',
      'Env vars are fixed and non-editable via UI.',
      'Brand asset validation checks /public/img/brand for required files and dimensions.',
      ...(detectedServiceAccountPath
        ? [`Service account file detected at ${detectedServiceAccountPath}.`]
        : [
            'Admin SDK detection checks FIREBASE_SERVICE_ACCOUNT(_FILE) or a service-account.json under packages/tenants/fireux-<ecosystem>/config/.',
          ]),
    ],

    brandAssets,
  }
})
