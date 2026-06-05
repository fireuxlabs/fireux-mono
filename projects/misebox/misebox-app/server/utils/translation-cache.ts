import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore'
import { createHash, createSign } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { KitchenStorage } from 'fireux-kitchens/runtime/models/kitchen.model.ts'
import { MenuStorage } from 'fireux-kitchens/runtime/models/menu.model.ts'

export type MenuTranslationCacheKeyInput = {
  fieldId: string
  targetLanguage: string
}

export type TranslationGlossaryKeyInput = {
  domain: string
  sourceLanguage: string
  sourceText: string
}

export type TranslationCacheDoc = {
  id: string
  field_id?: string
  domain: string
  glossary_version: string
  source_language: string
  target_language: string
  source_text: string
  translated_text: string
  provider: string
  reviewed?: boolean
  source_hash: string
  usage_count: number
  created: {
    at: unknown
    by: string
    app_id: string
  }
  updated: {
    at: unknown
    by: string
  }
}

export type TranslationGlossaryKind = 'glossary' | 'override'

export type TranslationGlossaryDoc = {
  id: string
  domain: string
  glossary_version: string
  source_language: string
  source_text: string
  source_hash: string
  kind: TranslationGlossaryKind
  translations: Record<string, string>
  verified: boolean
  provider: string
  usage_count: number
  created: {
    at: unknown
    by: string
    app_id: string
  }
  updated: {
    at: unknown
    by: string
  }
}

type ServiceAccount = {
  project_id?: string
  projectId?: string
  client_email?: string
  clientEmail?: string
  private_key?: string
  privateKey?: string
}

const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const SYSTEM_ACTOR = 'system:translation-cache'
const APP_ID = 'misebox-app'
const CACHE_COLLECTION = 'translation_cache'
const GLOSSARY_COLLECTION = 'translation_glossary'
const NATIVE_DATABASE_ID = 'misebox'
const DEFAULT_GLOSSARY_VERSION = 'restaurant_menu_v1'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/cloud-translation'

let cachedToken: { token: string; expiresAt: number } | null = null

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeString(value).replace(/_/g, '-')
const normalizeDomain = (value: unknown) =>
  normalizeString(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'general'
const normalizeGlossaryVersion = (value: unknown) =>
  normalizeString(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '_') ||
  DEFAULT_GLOSSARY_VERSION

const encodeBase64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

function findMonorepoRoot(startDir: string) {
  let dir = startDir
  for (let index = 0; index < 12; index += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue: string) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readServiceAccount(pathValue: string): Promise<ServiceAccount> {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`Service account file not found: ${pathValue}`)
  }

  const data = JSON.parse(await readFile(resolvedPath, 'utf8')) as ServiceAccount
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return data
}

function getServiceAccountField(
  account: ServiceAccount,
  snake: keyof ServiceAccount,
  camel: keyof ServiceAccount
) {
  return normalizeString(account[snake] || account[camel])
}

export function makeTranslationSourceHash(sourceText: string) {
  return createHash('sha256').update(normalizeString(sourceText), 'utf8').digest('hex')
}

export function makeMenuTranslationCacheKey(input: MenuTranslationCacheKeyInput) {
  const fieldId = normalizeString(input.fieldId)
  const targetLanguage = normalizeLanguageCode(input.targetLanguage)
  const fieldHash = createHash('sha256')
    .update([fieldId, targetLanguage].join('\n'), 'utf8')
    .digest('hex')

  if (!fieldId || !targetLanguage) return ''

  return `${targetLanguage}__${fieldHash.slice(0, 40)}`
}

export function makeTranslationGlossaryKey(input: TranslationGlossaryKeyInput) {
  const domain = normalizeDomain(input.domain)
  const sourceLanguage = normalizeLanguageCode(input.sourceLanguage)
  const sourceText = normalizeString(input.sourceText)
  const sourceHash = createHash('sha256')
    .update([domain, sourceLanguage, sourceText].join('\n'), 'utf8')
    .digest('hex')

  if (!sourceText) return ''
  if (!sourceLanguage) return ''

  return `${domain}__${sourceLanguage}__${sourceHash.slice(0, 40)}`
}

async function resolveServiceAccount() {
  const inline = normalizeString(process.env.FIREBASE_SERVICE_ACCOUNT)
  if (inline) {
    try {
      return JSON.parse(inline.startsWith('{') ? inline : Buffer.from(inline, 'base64').toString('utf8')) as ServiceAccount
    } catch {
      // Fall through to file-based credentials.
    }
  }

  const pathValue =
    normalizeString(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
    normalizeString(process.env.FIREBASE_SERVICE_ACCOUNT_FILE) ||
    DEFAULT_SERVICE_ACCOUNT_PATH

  return readServiceAccount(pathValue)
}

export async function getTranslationDatabases(): Promise<{
  defaultDb: Firestore
  nativeDb: Firestore
  account: ServiceAccount
}> {
  const account = await resolveServiceAccount()
  const projectId = getServiceAccountField(account, 'project_id', 'projectId')
  const appName = `misebox-translation:${projectId}`
  const existing = getApps().find((app) => app.name === appName)
  const app: App = existing || initializeApp(
    { credential: cert(account), projectId },
    appName
  )

  return {
    defaultDb: getFirestore(app),
    nativeDb: getFirestore(app, NATIVE_DATABASE_ID),
    account,
  }
}

async function getGoogleAccessToken(account: ServiceAccount) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const clientEmail = getServiceAccountField(account, 'client_email', 'clientEmail')
  const privateKey = getServiceAccountField(account, 'private_key', 'privateKey')
  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google service-account client email or private key')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: TOKEN_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  )
  const unsignedToken = `${header}.${claim}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedToken)
  signer.end()
  const signature = encodeBase64Url(signer.sign(privateKey.replace(/\\n/g, '\n')))
  const assertion = `${unsignedToken}.${signature}`

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const tokenData = await tokenResponse.json().catch(() => ({})) as {
    access_token?: string
    expires_in?: number
    error?: string
    error_description?: string
  }

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'Google auth failed')
  }

  cachedToken = {
    token: tokenData.access_token,
    expiresAt:
      Date.now() + Math.max(Number(tokenData.expires_in || 3600) - 60, 60) * 1000,
  }

  return cachedToken.token
}

export async function translateTextBatch(
  account: ServiceAccount,
  input: {
    texts: string[]
    sourceLanguage: string
    targetLanguage: string
  }
) {
  const projectId = getServiceAccountField(account, 'project_id', 'projectId')
  const token = await getGoogleAccessToken(account)
  const response = await fetch(
    `https://translation.googleapis.com/v3/projects/${encodeURIComponent(projectId)}:translateText`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: input.texts,
        mimeType: 'text/plain',
        sourceLanguageCode: input.sourceLanguage,
        targetLanguageCode: input.targetLanguage,
      }),
    }
  )
  const data = await response.json().catch(() => ({})) as {
    translations?: Array<{ translatedText?: string }>
    error?: { message?: string; status?: string }
  }

  if (!response.ok) {
    throw new Error(data.error?.message || data.error?.status || 'Google Translate failed')
  }

  return (data.translations || []).map((entry) => normalizeString(entry?.translatedText))
}

export function menuTranslationCacheDocRef(
  db: Firestore,
  input: {
    kitchenCollectionPath?: string
    kitchenId: string
    menuId: string
    id: string
  }
) {
  const kitchenCollectionPath =
    normalizeString(input.kitchenCollectionPath) || KitchenStorage.rootCollection

  return db
    .doc(`${kitchenCollectionPath}/${input.kitchenId}`)
    .collection(MenuStorage.collection)
    .doc(input.menuId)
    .collection(CACHE_COLLECTION)
    .doc(input.id)
}

export function translationGlossaryDocRef(db: Firestore, id: string) {
  return db.collection(GLOSSARY_COLLECTION).doc(id)
}

export function buildTranslationCacheDoc(input: {
  id: string
  fieldId?: string
  domain: string
  glossaryVersion?: string
  sourceLanguage: string
  targetLanguage: string
  sourceText: string
  translatedText: string
  provider: string
}): TranslationCacheDoc {
  return {
    id: input.id,
    ...(normalizeString(input.fieldId) ? { field_id: normalizeString(input.fieldId) } : {}),
    domain: normalizeDomain(input.domain),
    glossary_version: normalizeGlossaryVersion(input.glossaryVersion),
    source_language: normalizeLanguageCode(input.sourceLanguage),
    target_language: normalizeLanguageCode(input.targetLanguage),
    source_text: normalizeString(input.sourceText),
    translated_text: normalizeString(input.translatedText),
    provider: normalizeString(input.provider) || 'unknown',
    source_hash: makeTranslationSourceHash(input.sourceText),
    usage_count: 1,
    created: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
      app_id: APP_ID,
    },
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

export function buildTranslationGlossaryDoc(input: {
  id: string
  domain: string
  glossaryVersion?: string
  sourceLanguage: string
  sourceText: string
  translations: Record<string, string>
  kind: TranslationGlossaryKind
  provider: string
  verified?: boolean
}): TranslationGlossaryDoc {
  const translations: Record<string, string> = {}
  for (const [language, text] of Object.entries(input.translations || {})) {
    const code = normalizeLanguageCode(language)
    const value = normalizeString(text)
    if (code && value) translations[code] = value
  }

  return {
    id: input.id,
    domain: normalizeDomain(input.domain),
    glossary_version: normalizeGlossaryVersion(input.glossaryVersion),
    source_language: normalizeLanguageCode(input.sourceLanguage),
    source_text: normalizeString(input.sourceText),
    source_hash: makeTranslationSourceHash(input.sourceText),
    kind: input.kind,
    translations,
    verified: input.verified === true,
    provider: normalizeString(input.provider) || 'unknown',
    usage_count: 0,
    created: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
      app_id: APP_ID,
    },
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

export {
  GLOSSARY_COLLECTION as TRANSLATION_GLOSSARY_COLLECTION,
  DEFAULT_GLOSSARY_VERSION as RESTAURANT_MENU_GLOSSARY_VERSION,
}
