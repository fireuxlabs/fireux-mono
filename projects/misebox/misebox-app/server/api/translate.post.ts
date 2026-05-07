import { createError, defineEventHandler, readBody } from 'h3'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { createSign } from 'node:crypto'

type TranslateRequestBody = {
  text?: unknown
  from?: unknown
  to?: unknown
}

type ServiceAccount = {
  project_id?: string
  projectId?: string
  client_email?: string
  clientEmail?: string
  private_key?: string
  privateKey?: string
}

type AccessToken = {
  access_token: string
  expires_in?: number
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/cloud-translation'

let cachedToken: { token: string; expiresAt: number } | null = null

const normalizeString = (value: unknown) => String(value ?? '').trim()

const encodeBase64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

function findMonorepoRoot(startDir: string) {
  let dir = startDir
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function parseServiceAccountJson(raw: string): ServiceAccount | null {
  try {
    return JSON.parse(raw) as ServiceAccount
  } catch {
    return null
  }
}

async function readServiceAccountPath(pathValue: string) {
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [
        resolve(process.cwd(), pathValue),
        resolve(findMonorepoRoot(process.cwd()), pathValue),
      ]

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const raw = await readFile(candidate, 'utf8')
    const parsed = parseServiceAccountJson(raw)
    if (parsed) return parsed
  }

  return null
}

async function resolveServiceAccount() {
  const inline = normalizeString(process.env.FIREBASE_SERVICE_ACCOUNT)
  if (inline) {
    const parsed = parseServiceAccountJson(inline)
    if (parsed) return parsed
  }

  const encodedInline = inline && !inline.startsWith('{')
    ? Buffer.from(inline, 'base64').toString('utf8')
    : ''
  if (encodedInline) {
    const parsed = parseServiceAccountJson(encodedInline)
    if (parsed) return parsed
  }

  const credentialValue =
    normalizeString(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
    normalizeString(process.env.FIREBASE_SERVICE_ACCOUNT_FILE)

  if (credentialValue) {
    if (credentialValue.startsWith('{')) {
      const parsed = parseServiceAccountJson(credentialValue)
      if (parsed) return parsed
    }

    const parsed = await readServiceAccountPath(credentialValue)
    if (parsed) return parsed
  }

  const root = findMonorepoRoot(process.cwd())
  return readServiceAccountPath(
    join(
      root,
      'packages',
      'ecosystem',
      'fireux-misebox',
      'src',
      'config',
      'firebase',
      'service-account.json'
    )
  )
}

function getServiceAccountField(account: ServiceAccount, snake: keyof ServiceAccount, camel: keyof ServiceAccount) {
  return normalizeString(account[snake] || account[camel])
}

async function getGoogleAccessToken(account: ServiceAccount) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const clientEmail = getServiceAccountField(account, 'client_email', 'clientEmail')
  const privateKey = getServiceAccountField(account, 'private_key', 'privateKey')

  if (!clientEmail || !privateKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Google service-account client email or private key',
    })
  }

  const now = Math.floor(Date.now() / 1000)
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = encodeBase64Url(JSON.stringify({
    iss: clientEmail,
    scope: TOKEN_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }))
  const unsignedToken = `${header}.${claim}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedToken)
  signer.end()
  const signature = encodeBase64Url(
    signer.sign(privateKey.replace(/\\n/g, '\n'))
  )
  const assertion = `${unsignedToken}.${signature}`

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const tokenData = await tokenResponse.json().catch(() => ({})) as Partial<AccessToken> & {
    error?: string
    error_description?: string
  }

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw createError({
      statusCode: 502,
      statusMessage: tokenData.error_description || tokenData.error || 'Google auth failed',
    })
  }

  cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + Math.max(Number(tokenData.expires_in || 3600) - 60, 60) * 1000,
  }

  return cachedToken.token
}

async function translateWithGoogle(input: {
  text: string
  from: string
  to: string
  account: ServiceAccount
}) {
  const projectId = getServiceAccountField(input.account, 'project_id', 'projectId')
  if (!projectId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Google service-account project id',
    })
  }

  const token = await getGoogleAccessToken(input.account)
  const response = await fetch(
    `https://translation.googleapis.com/v3/projects/${encodeURIComponent(projectId)}:translateText`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: [input.text],
        mimeType: 'text/plain',
        sourceLanguageCode: input.from,
        targetLanguageCode: input.to,
      }),
    }
  )

  const data = await response.json().catch(() => ({})) as {
    translations?: Array<{ translatedText?: string }>
    error?: { message?: string; status?: string }
  }

  if (!response.ok) {
    throw createError({
      statusCode: response.status === 403 ? 502 : response.status,
      statusMessage: data.error?.message || data.error?.status || 'Google Translate failed',
    })
  }

  return normalizeString(data.translations?.[0]?.translatedText)
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => null)) as TranslateRequestBody | null
  const text = normalizeString(body?.text)
  const from = normalizeString(body?.from || 'en')
  const to = normalizeString(body?.to)

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Text is required',
    })
  }

  if (!to) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target language is required',
    })
  }

  const account = await resolveServiceAccount()
  if (!account) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Google service-account credentials',
    })
  }

  const translated = await translateWithGoogle({ text, from, to, account })

  return {
    text: translated,
    from,
    to,
    provider: 'google',
  }
})
