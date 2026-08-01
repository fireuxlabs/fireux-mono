import { GoogleAuth } from 'google-auth-library'
import {
  SPROOCHLI_PROVIDER_DEV_URL,
  type SproochliMenuResolveRequest,
  type SproochliMenuResolveResponse,
} from '../../composables/fireux/sproochli/provider'

const PROVIDER_PATH = '/api/tools/menu'
const PROVIDER_TIMEOUT_MS = 8_000

function configuredProvider() {
  const development = process.env.NODE_ENV !== 'production'
  const endpointValue = String(
    process.env.SPROOCHLI_MENU_PROVIDER_ENDPOINT ||
      (development ? `${SPROOCHLI_PROVIDER_DEV_URL}${PROVIDER_PATH}` : '')
  ).trim()
  let endpoint: URL
  try {
    endpoint = new URL(endpointValue)
  } catch {
    throw new Error('Sproochli Menu provider is unavailable.')
  }

  const localDevelopment =
    development &&
    endpoint.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '::1'].includes(endpoint.hostname)
  if (localDevelopment) {
    return {
      endpoint: endpoint.toString(),
      audience: '',
      authenticated: false,
    }
  }

  const audienceValue = String(
    process.env.SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE || ''
  ).trim()
  let audience: URL
  try {
    audience = new URL(audienceValue)
  } catch {
    throw new Error('Sproochli Menu provider is unavailable.')
  }
  if (
    endpoint.protocol !== 'https:' ||
    audience.protocol !== 'https:' ||
    endpoint.toString() !== audience.toString()
  ) {
    throw new Error('Sproochli Menu provider is unavailable.')
  }

  return {
    endpoint: endpoint.toString(),
    audience: audience.toString(),
    authenticated: true,
  }
}

export async function resolveSproochliMenu(
  input: SproochliMenuResolveRequest
) {
  const provider = configuredProvider()
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
  }
  if (provider.authenticated) {
    const client = await new GoogleAuth().getIdTokenClient(provider.audience)
    const token = await client.idTokenProvider.fetchIdToken(provider.audience)
    headers.authorization = `Bearer ${token}`
  }

  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`Sproochli Menu resolution failed: ${response.status}`)
  }
  return await response.json() as SproochliMenuResolveResponse
}
