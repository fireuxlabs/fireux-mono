# Server Report: src/runtime/server/\*\*

This report enumerates all files under packages/\*\*/src/runtime/server and shows concise summaries.

## packages/core/fireux-core/src/runtime/server/api/app.get.ts

- defineEventHandler from h3
- Reads env for identity, colors, URLs; returns JSON app info

## packages/core/fireux-core/src/runtime/server/api/health.get.ts

- defineEventHandler from h3; node:path and node:fs
- Uses Nitro-provided useRuntimeConfig() at runtime (no app alias import)
- Returns service account details and public.appSettings

## packages/core/fireux-core/src/runtime/server/api/proxy/google-avatar.ts

- defineEventHandler, getQuery, setResponseHeaders, createError from h3
- Validates Google image URL, fetches and returns image buffer with headers

## packages/core/fireux-core/src/runtime/server/api/stripe/create-product.post.ts

- defineEventHandler, readBody, createError from h3
- Lazy imports stripe; creates product and prices; optional Firestore update

## packages/core/fireux-core/src/runtime/server/api/stripe/create-subscription.post.ts

- Deprecated: now returns 501 Not Implemented (stub); endpoint not used by apps

## packages/core/fireux-core/src/runtime/server/api/firestore/update-document.post.ts

- Deprecated: now returns 410 Gone (stub); direct Firestore updates removed from core

## packages/core/fireux-core/src/runtime/server/api/app/env-check.ts

- defineEventHandler; returns basic env data (implementation in repo)

## packages/core/fireux-core/src/runtime/server/api/app/ensure-app.post.ts

- Deprecated: now returns 410 Gone (stub); not wired in server-config

## packages/core/fireux-core/src/runtime/server/api/app/theme.get.ts

- Deprecated: now returns 410 Gone (stub); use /api/app for env-based identity

## packages/core/fireux-core/src/runtime/server/utils/getAdmin.ts

- Guarded singleton initializer for firebase-admin

## packages/core/fireux-core/src/runtime/server/stripe/version.ts

- Export const STRIPE_API_VERSION = '2025-08-27.basil'

## packages/core/fireux-core/src/runtime/server/api/stripe/version.ts

- Re-exports/constant for stripe API version (present in repo)

Notes:

- No occurrences of imports from '#app', 'nuxt/app', '#imports', or '#build' in any server files.
- Tenant fireux-misebox contains no src/runtime/server directory with handlers; server-config.ts in tenant is a no-op.

---

## Full contents

### packages/core/fireux-core/src/runtime/server/api/app.get.ts

```ts
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (_event) => {
  // Access environment variables directly in server context
  const appName = process.env.APP_NAME || 'FireUX App'
  const projectName = process.env.PROJECT_NAME || 'FireUX'
  const appShortName = process.env.APP_SHORT_NAME || 'FireUX'
  const appId = process.env.APP_ID || 'fireux-app'
  const domain = process.env.APP_DOMAIN || 'https://fireux.app'
  const appPrimaryColor = process.env.APP_PRIMARY_COLOR || 'FACC15'
  const appNeutralColor = process.env.APP_NEUTRAL_COLOR || '71717A'
  const appIcon = process.env.APP_ICON || 'flame'

  // Ensure a single leading '#'
  const normalizeHex = (value: string) =>
    `#${(value || '').replace(/^#+/, '').trim()}`

  // App info using environment variables
  const appInfo = {
    name: appName,
    projectName: projectName,
    shortName: appShortName,
    appId: appId,
    description: `${appName} - Part of the FireUX ecosystem`,
    version: '1.0.0',
    status: 'Available',
    url: domain,

    // Theme colors from env vars
    theme: {
      primary: normalizeHex(appPrimaryColor),
      neutral: normalizeHex(appNeutralColor),
    },

    // Assets
    assets: {
      icon: appIcon,
      logo: '/img/logo-type-light.svg',
      logoDark: '/img/logo-type-dark.svg',
      favicon: '/favicon.ico',
      ogImage: '/img/og-image.png',
    },

    // App-specific metadata
    features: [
      'Dashboard Templates',
      'Authentication System',
      'Component Library',
    ],
    category: 'framework',
    tags: ['vue', 'nuxt', 'firebase', 'ui'],

    // API metadata
    lastUpdated: new Date().toISOString(),
    api: {
      version: '1.0.0',
      endpoints: {
        app: '/api/app',
        health: '/api/health',
      },
    },
  }

  return {
    success: true,
    data: appInfo,
  }
})
```

### packages/core/fireux-core/src/runtime/server/api/health.get.ts

```ts
import { defineEventHandler } from 'h3'
import { resolve } from 'node:path'
import { existsSync, statSync } from 'node:fs'

export default defineEventHandler(() => {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
  const absPath = envPath ? resolve(process.cwd(), envPath) : ''
  const exists = absPath ? existsSync(absPath) : false
  const size = exists ? statSync(absPath).size : 0

  // In Nitro server runtime, useRuntimeConfig is available without importing from app aliases
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - provided by Nitro at runtime
  const runtime = (
    typeof useRuntimeConfig !== 'undefined' ? useRuntimeConfig() : undefined
  ) as any
  const appSettings = runtime?.public?.appSettings || null

  return {
    serviceAccount: {
      envPath,
      absPath,
      exists,
      size,
      hasServiceAccountString: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    },
    appSettings,
  }
})
```

### packages/core/fireux-core/src/runtime/server/api/proxy/google-avatar.ts

```ts
import {
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  createError,
} from 'h3'

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid URL parameter',
    })
  }

  // Only allow Google profile images
  if (!url.includes('googleusercontent.com') && !url.includes('google.com')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only Google profile images are allowed',
    })
  }

  try {
    // Fetch the image from Google
    const response = await fetch(url)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch image',
      })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Set appropriate headers
    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
    })

    return imageBuffer
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy image',
    })
  }
})
```

### packages/core/fireux-core/src/runtime/server/utils/getAdmin.ts

```ts
import * as admin from 'firebase-admin'

// Guarded singleton accessor for firebase-admin
export function getAdmin() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      })
    } catch {
      // In case of race during dev HMR, ignore
    }
  }
  return admin
}
```

### packages/core/fireux-core/src/runtime/server/api/stripe/create-product.post.ts

```ts
// ~/server/api/stripe/create-product.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { STRIPE_API_VERSION } from '../stripe/version'

export default defineEventHandler(async (event) => {
  try {
    // Quick guard: if no secret key, return 501 (not configured) instead of crashing
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Stripe not configured (missing STRIPE_SECRET_KEY)',
      })
    }

    // Lazy import Stripe so dev without the package/env won’t crash at load time
    const { default: Stripe } = await import('stripe').catch(() => ({
      default: null as any,
    }))
    if (!Stripe) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Stripe SDK not installed',
      })
    }

    const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
    const body = await readBody(event)
    const { product, ping } = body

    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product data is required',
      })
    }

    console.log('🔄 [create-product] Creating Stripe product:', product.name)
    if (ping) {
      console.log('🏓 [create-product] Ping received:', ping)
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description || '',
      metadata: {
        appId: product.appId || '',
        slug: product.slug || '',
      },
    })

    console.log('✅ [create-product] Stripe product created:', stripeProduct.id)

    // Create prices if provided
    const stripePrices = []
    if (product.prices && product.prices.length > 0) {
      for (const price of product.prices) {
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: price.unit_amount,
          currency: price.currency || 'eur',
          recurring:
            price.type === 'recurring'
              ? {
                  interval: price.interval,
                  interval_count: price.interval_count || 1,
                }
              : undefined,
        })
        stripePrices.push(stripePrice)
        console.log('✅ [create-product] Stripe price created:', stripePrice.id)
      }
    }

    // Call Firestore update endpoint if product creation was successful
    let firestoreResult = null
    if (stripeProduct.id) {
      try {
        console.log('📝 [create-product] Calling Firestore update endpoint...')
        firestoreResult = await fetch('/api/stripe/update-firestore', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            stripeProductId: stripeProduct.id,
            product: product,
            stripePrices: stripePrices,
            pong: ping === 'ping' ? 'pong' : undefined,
          }),
        })
        console.log('✅ [create-product] Firestore update completed')
      } catch (firestoreError) {
        console.warn(
          '⚠️ [create-product] Firestore update failed:',
          firestoreError
        )
      }
    }

    return {
      success: true,
      id: stripeProduct.id,
      stripe_prices: stripePrices.map((p) => p.id),
      message: `Product '${product.name}' created successfully in Stripe`,
      pong: ping === 'ping' ? 'pong' : undefined,
      firestore: firestoreResult ? 'updated' : 'skipped',
    }
  } catch (error) {
    console.error('❌ [create-product] Error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create product: ${errorMessage}`,
    })
  }
})
```

### packages/core/fireux-core/src/runtime/server/api/stripe/create-subscription.post.ts

```ts
import { defineEventHandler, createError } from 'h3'

// Deprecated: stripe subscriptions are not handled server-side here anymore.
export default defineEventHandler(() => {
  throw createError({ statusCode: 501, statusMessage: 'Not implemented' })
})
```

### packages/core/fireux-core/src/runtime/server/api/firestore/update-document.post.ts

```ts
import { defineEventHandler, createError } from 'h3'

// Deprecated: Firestore direct updates removed from core server.
export default defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: 'Endpoint removed' })
})
```

### packages/core/fireux-core/src/runtime/server/api/app/env-check.ts

```ts
import { defineEventHandler } from 'h3'

export default defineEventHandler((_event) => {
  // Check for required environment variables
  const requiredEnvVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID',
  ]

  const optionalEnvVars = [
    'APP_NAME',
    'APP_SHORT_NAME',
    'APP_ID',
    'APP_PRIMARY_COLOR',
    'APP_NEUTRAL_COLOR',
    'APP_ICON',
    'APP_DOMAIN',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
  ]

  const missingVars = requiredEnvVars.filter((key) => !process.env[key])
  const presentOptionalVars = optionalEnvVars.filter((key) => process.env[key])

  return {
    isValid: missingVars.length === 0,
    required: requiredEnvVars.map((key) => ({
      key,
      present: !!process.env[key],
      value: process.env[key] ? '***' : undefined,
    })),
    optional: optionalEnvVars.map((key) => ({
      key,
      present: !!process.env[key],
      value: process.env[key] ? '***' : undefined,
    })),
    missingRequired: missingVars,
    summary: {
      required: `${requiredEnvVars.length - missingVars.length}/${requiredEnvVars.length}`,
      optional: `${presentOptionalVars.length}/${optionalEnvVars.length}`,
    },
  }
})
```

### packages/core/fireux-core/src/runtime/server/api/app/ensure-app.post.ts

```ts
import { defineEventHandler, createError } from 'h3'

// Deprecated: This endpoint was unused and has been removed from the public API.
export default defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: 'Endpoint removed' })
})
```

### packages/core/fireux-core/src/runtime/server/api/app/theme.get.ts

```ts
import { defineEventHandler, createError } from 'h3'

// Deprecated: Unused endpoint. Use /api/app for identity and theme via envs.
export default defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: 'Endpoint removed' })
})
```

### packages/core/fireux-core/src/runtime/server/stripe/version.ts

```ts
export const STRIPE_API_VERSION = '2025-08-27.basil' as const
```

### packages/core/fireux-core/src/runtime/server/api/stripe/version.ts

```ts
export const STRIPE_API_VERSION = '2025-08-27.basil'
```
