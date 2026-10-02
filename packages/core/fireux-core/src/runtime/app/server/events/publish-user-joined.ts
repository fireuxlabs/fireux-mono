import { GoogleAuth } from 'google-auth-library'
import type { AppUserJoinedPublicationV1 } from '../../models/user-joined-publication'

function configuredTarget() {
  const endpoint = String(process.env.FIREUX_SIGNUP_MONITOR_ENDPOINT || '').trim()
  const audience = String(process.env.FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE || '').trim()

  if (!endpoint && !audience) return null

  let endpointUrl: URL
  let audienceUrl: URL
  try {
    endpointUrl = new URL(endpoint)
    audienceUrl = new URL(audience)
  } catch {
    throw new Error('Signup monitor delivery is misconfigured.')
  }

  if (
    endpointUrl.protocol !== 'https:' ||
    audienceUrl.protocol !== 'https:' ||
    endpointUrl.origin !== audienceUrl.origin
  ) {
    throw new Error('Signup monitor delivery is misconfigured.')
  }

  return {
    endpoint: endpointUrl.toString(),
    audience: audienceUrl.toString(),
  }
}

type MonitorOutcome = 'disabled' | 'delivered' | 'duplicate'

export async function publishAppUserJoinedPublication(
  publication: AppUserJoinedPublicationV1
): Promise<MonitorOutcome> {
  const target = configuredTarget()
  if (!target) return 'disabled'

  const client = await new GoogleAuth().getIdTokenClient(target.audience)
  const token = await client.idTokenProvider.fetchIdToken(target.audience)
  const response = await fetch(target.endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(publication),
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) {
    throw new Error(`Signup monitor receiver returned ${response.status}.`)
  }

  const result = (await response.json()) as { outcome?: unknown }
  return result.outcome === 'duplicate' ? 'duplicate' : 'delivered'
}
