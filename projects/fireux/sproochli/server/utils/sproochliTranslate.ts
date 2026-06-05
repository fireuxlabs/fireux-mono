import { createHash, createSign } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'

export type SproochliServiceAccount = {
  project_id?: string
  projectId?: string
  client_email?: string
  clientEmail?: string
  private_key?: string
  privateKey?: string
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/cloud-translation'

let cachedToken: { token: string; expiresAt: number } | null = null

export const normalizeSproochliText = (value: unknown) => String(value ?? '').trim()

export const normalizeSproochliLanguageCode = (value: unknown) =>
  normalizeSproochliText(value).replace(/_/g, '-').toLowerCase()

const encodeBase64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

function resolveCredentialPath(pathValue: string) {
  return isAbsolute(pathValue) ? pathValue : resolve(process.cwd(), pathValue)
}

function serviceAccountField(
  account: SproochliServiceAccount,
  snake: keyof SproochliServiceAccount,
  camel: keyof SproochliServiceAccount
) {
  return normalizeSproochliText(account[snake] || account[camel])
}

function parseInlineServiceAccount(value: string) {
  const raw = value.startsWith('{') ? value : Buffer.from(value, 'base64').toString('utf8')
  return JSON.parse(raw) as SproochliServiceAccount
}

async function readServiceAccount(pathValue: string) {
  const resolvedPath = resolveCredentialPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`Sproochli service account file not found: ${pathValue}`)
  }

  return JSON.parse(await readFile(resolvedPath, 'utf8')) as SproochliServiceAccount
}

export async function resolveSproochliServiceAccount() {
  const inline = normalizeSproochliText(process.env.FIREBASE_SERVICE_ACCOUNT)
  const file =
    normalizeSproochliText(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
    normalizeSproochliText(process.env.FIREBASE_SERVICE_ACCOUNT_FILE)
  const account = inline
    ? parseInlineServiceAccount(inline)
    : file
      ? await readServiceAccount(file)
      : null

  if (!account) {
    throw new Error(
      'Sproochli translation requires FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.'
    )
  }

  if (
    !serviceAccountField(account, 'project_id', 'projectId') ||
    !serviceAccountField(account, 'client_email', 'clientEmail') ||
    !serviceAccountField(account, 'private_key', 'privateKey')
  ) {
    throw new Error('Sproochli service account is missing project_id, client_email, or private_key.')
  }

  return account
}

async function getGoogleAccessToken(account: SproochliServiceAccount) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const clientEmail = serviceAccountField(account, 'client_email', 'clientEmail')
  const privateKey = serviceAccountField(account, 'private_key', 'privateKey')
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

  const assertion = `${unsignedToken}.${encodeBase64Url(
    signer.sign(privateKey.replace(/\\n/g, '\n'))
  )}`
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

export function makeSproochliSourceHash(sourceText: string) {
  return createHash('sha256').update(normalizeSproochliText(sourceText), 'utf8').digest('hex')
}

export function makeSproochliMenuCacheKey(input: {
  fieldId: string
  targetLanguage: string
}) {
  const fieldId = normalizeSproochliText(input.fieldId)
  const targetLanguage = normalizeSproochliLanguageCode(input.targetLanguage)
  if (!fieldId || !targetLanguage) return ''

  const hash = createHash('sha256')
    .update([fieldId, targetLanguage].join('\n'), 'utf8')
    .digest('hex')

  return `${targetLanguage}__${hash.slice(0, 40)}`
}

export async function translateSproochliTextBatch(
  account: SproochliServiceAccount,
  input: {
    texts: string[]
    sourceLanguage: string
    targetLanguage: string
  }
) {
  const projectId = serviceAccountField(account, 'project_id', 'projectId')
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

  return (data.translations || []).map((entry) => normalizeSproochliText(entry.translatedText))
}
