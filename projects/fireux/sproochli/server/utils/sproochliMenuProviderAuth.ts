import {
  createError,
  getRequestURL,
  type H3Event,
} from 'h3'
import type {
  SproochliHostTarget,
} from 'fireux-sproochli/runtime/host'
import { requireBearerToken } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  ServiceAccountOidcError,
  verifyServiceAccountOidc,
} from 'fireux-core/runtime/server/utils/auth/service-account-oidc'

type SproochliMenuProviderSourceScope = {
  serviceAccountEmail: string
  firebaseProjectId: string
  databaseId: string
  appIds: string[]
}

const text = (value: unknown) => String(value ?? '').trim()

function parseSourceScopes(value: string): SproochliMenuProviderSourceScope[] {
  if (!value.trim()) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('Sproochli Menu provider source scopes are invalid.')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Sproochli Menu provider source scopes are invalid.')
  }

  return parsed.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error('Sproochli Menu provider source scopes are invalid.')
    }
    const source = entry as Record<string, unknown>
    const scope = {
      serviceAccountEmail: text(source.service_account_email).toLowerCase(),
      firebaseProjectId: text(source.firebase_project_id),
      databaseId: text(source.database_id),
      appIds: Array.isArray(source.app_ids)
        ? [...new Set(source.app_ids.map(text).filter(Boolean))]
        : [],
    }
    if (
      !scope.serviceAccountEmail.endsWith('.gserviceaccount.com') ||
      !scope.firebaseProjectId ||
      scope.databaseId !== 'sproochli' ||
      !scope.appIds.length
    ) {
      throw new Error('Sproochli Menu provider source scopes are invalid.')
    }
    return scope
  })
}

function receiverConfig() {
  const audience = text(
    process.env.SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE
  )
  const scopes = parseSourceScopes(
    String(process.env.SPROOCHLI_MENU_PROVIDER_SOURCE_SCOPES || '')
  )
  let audienceUrl: URL
  try {
    audienceUrl = new URL(audience)
  } catch {
    throw new Error('Sproochli Menu provider authentication is unavailable.')
  }
  if (audienceUrl.protocol !== 'https:' || !scopes.length) {
    throw new Error('Sproochli Menu provider authentication is unavailable.')
  }
  return { audience: audienceUrl.toString(), scopes }
}

function isLoopbackDevelopmentRequest(event: H3Event) {
  if (process.env.NODE_ENV === 'production') return false
  const address = text(event.node.req.socket.remoteAddress).toLowerCase()
  const hostname = getRequestURL(event).hostname.toLowerCase()
  return (
    address === '127.0.0.1' ||
    address === '::1' ||
    address === '::ffff:127.0.0.1' ||
    ['localhost', '127.0.0.1', '::1'].includes(hostname)
  )
}

export async function assertSproochliMenuProviderAccess(
  event: H3Event,
  host: SproochliHostTarget
) {
  if (isLoopbackDevelopmentRequest(event)) {
    return { kind: 'local-development' as const }
  }

  let config: ReturnType<typeof receiverConfig>
  try {
    config = receiverConfig()
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Sproochli Menu provider is unavailable.',
    })
  }

  const token = requireBearerToken(
    event,
    'Sproochli Menu provider authentication is required.'
  )
  let principal
  try {
    principal = await verifyServiceAccountOidc(token, config.audience)
  } catch (error) {
    if (error instanceof ServiceAccountOidcError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Sproochli Menu provider authentication failed.',
      })
    }
    throw error
  }

  const authorized = config.scopes.some(scope =>
    scope.serviceAccountEmail === principal.service_account_email &&
    scope.firebaseProjectId === host.firebaseProjectId &&
    scope.databaseId === host.databaseId &&
    scope.appIds.includes(host.appId)
  )
  if (!authorized) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Sproochli Menu provider source is not authorized.',
    })
  }
  return {
    kind: 'service-account' as const,
    serviceAccountEmail: principal.service_account_email,
  }
}
