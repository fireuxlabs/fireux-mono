import { defineEventHandler } from 'h3'
// Use a type-only import for Nitro runtime config and a declare for the runtime helper to avoid app alias imports in server bundle
// Provided by Nitro at runtime; declared for TS only (any to avoid importing types)
declare function useRuntimeConfig(): any
import { resolve } from 'node:path'
import { existsSync, statSync } from 'node:fs'

export default defineEventHandler(() => {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
  const absPath = envPath ? resolve(process.cwd(), envPath) : ''
  const exists = absPath ? existsSync(absPath) : false
  const size = exists ? statSync(absPath).size : 0

  const runtime =
    typeof useRuntimeConfig === 'function'
      ? (useRuntimeConfig() as any)
      : undefined
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
