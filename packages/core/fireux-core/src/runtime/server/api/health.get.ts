import { defineEventHandler } from 'h3'
import { resolve } from 'node:path'
import { existsSync, statSync } from 'node:fs'
// useRuntimeConfig is injected by Nuxt at runtime
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
  const absPath = envPath ? resolve(process.cwd(), envPath) : ''
  const exists = absPath ? existsSync(absPath) : false
  const size = exists ? statSync(absPath).size : 0

  const runtime = useRuntimeConfig?.() as any
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
