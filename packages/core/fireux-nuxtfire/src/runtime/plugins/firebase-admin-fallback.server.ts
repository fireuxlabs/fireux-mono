import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
  type AppOptions,
  type ServiceAccount,
} from 'firebase-admin/app'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig } from '#imports'
import { promises as fs } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

const ADMIN_APP_NAME = 'vuefire-admin'
let adminAppPromise: Promise<App> | null = null

const text = (value: unknown) => String(value ?? '').trim()

function parseServiceAccount(rawValue: string): ServiceAccount {
  const raw = rawValue.startsWith('{')
    ? rawValue
    : Buffer.from(rawValue, 'base64').toString('utf8')
  return JSON.parse(raw) as ServiceAccount
}

async function loadExplicitServiceAccount(): Promise<ServiceAccount | null> {
  const inline = text(process.env.FIREBASE_SERVICE_ACCOUNT)
  if (inline) return parseServiceAccount(inline)

  const filePath = text(process.env.FIREBASE_SERVICE_ACCOUNT_FILE)
  if (filePath) {
    const absolutePath = isAbsolute(filePath)
      ? filePath
      : resolve(process.cwd(), filePath)
    return JSON.parse(await fs.readFile(absolutePath, 'utf8')) as ServiceAccount
  }

  const projectId = text(process.env.FIREBASE_PROJECT_ID)
  const clientEmail = text(process.env.FIREBASE_CLIENT_EMAIL)
  const privateKey = text(process.env.FIREBASE_PRIVATE_KEY)
  if (clientEmail || privateKey) {
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Split Firebase credentials require FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY together.'
      )
    }
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }
  }

  return null
}

async function getOrInitializeAdminApp(
  options: Omit<AppOptions, 'credential'>
) {
  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME)
  if (existing) return existing

  if (!adminAppPromise) {
    adminAppPromise = (async () => {
      const serviceAccount = await loadExplicitServiceAccount()
      const appAfterCredentialLoad = getApps().find(
        (app) => app.name === ADMIN_APP_NAME
      )
      if (appAfterCredentialLoad) return appAfterCredentialLoad

      return initializeApp(
        optionsForCredential(options, serviceAccount),
        ADMIN_APP_NAME
      )
    })()
  }

  try {
    return await adminAppPromise
  } catch (error) {
    adminAppPromise = null
    throw error
  }
}

function optionsForCredential(
  options: Omit<AppOptions, 'credential'>,
  serviceAccount: ServiceAccount | null
): AppOptions {
  return {
    ...options,
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
  }
}

export default defineNuxtPlugin(async () => {
  const event = useRequestEvent()
  const runtime = useRuntimeConfig() as any
  const adminOptions = runtime.vuefire?.admin?.options ?? {}
  const projectId = text(
    adminOptions.projectId || runtime.public?.vuefire?.config?.projectId
  )
  const serviceAccountId = text(
    adminOptions.serviceAccountId || process.env.FIREBASE_SERVICE_ACCOUNT_ID
  )

  const firebaseAdminApp = await getOrInitializeAdminApp({
    ...adminOptions,
    ...(projectId ? { projectId } : {}),
    ...(serviceAccountId ? { serviceAccountId } : {}),
  })

  if (event) {
    event.context.firebaseApp = firebaseAdminApp
  }

  // nuxt-vuefire's Admin plugin runs after this prepended initializer. It sees
  // the named app above and owns the single `$firebaseAdminApp` Nuxt injection.
})
