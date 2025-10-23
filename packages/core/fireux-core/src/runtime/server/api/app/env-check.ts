// FILE: packages/core/fireux-core/src/runtime/server/api/app/env-check.ts
import { defineEventHandler } from 'h3'
import { join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import imageSize from 'image-size'

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
interface EnvCheckResponse {
  isValid: boolean
  required: EnvVarEntry[]
  optionalClient: EnvVarEntry[]
  server: {
    adminAuth: AdminAuthStatus
    optional: EnvVarEntry[]
  }
  missingRequired: string[]
  summary: {
    required: string
    optionalClient: string
    optionalServer: string
    brandAssets: string
  }
  warnings: string[]
  notes: string[]
  brandAssets: BrandAssetCheck[]
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

  if (!dim.type) {
    result.reason = 'Unknown file type'
    return result
  }

  const isSvg = dim.type === 'svg'
  const isPng = dim.type === 'png'

  if (name === 'wordmark' && isSvg) {
    result.ok = true
    return result
  }

  if (!isSvg && !isPng) {
    result.reason = 'Must be SVG or PNG'
    return result
  }

  // Validation per asset type
  if (name === 'avatar' || name === 'logo') {
    if (!requiredWidth || !requiredHeight) {
      result.ok = true
      return result
    }
    if (dim.width === requiredWidth && dim.height === requiredHeight) {
      result.ok = true
    } else {
      result.reason = `Must be exactly ${requiredWidth}×${requiredHeight} (got ${dim.width}×${dim.height})`
    }
  } else if (name === 'wordmark' && isPng) {
    if (
      dim.width >= (minWidth || 256) &&
      dim.height >= (minHeight || 64) &&
      dim.width / dim.height >= (minAspect || 3)
    ) {
      result.ok = true
    } else {
      result.reason = `Must be ≥256×64 with aspect ≥3:1 (got ${dim.width}×${dim.height})`
    }
  }

  return result
}

/**
 * NOTE:
 * - `role` is enforced via Nuxt config (createFireuxConfig), not env; we do NOT check it here.
 * - This route only validates process.env presence/shape and brand asset existence.
 */
export default defineEventHandler<EnvCheckResponse>(() => {
  const env = process.env as Record<string, string | undefined>

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
  const serverAuthConfigured = serverAuthJson || serverAuthSplit

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

  return {
    isValid:
      missingRequired.length === 0 && passedBrandCount === brandAssets.length,

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
    ],

    brandAssets,
  }
})
