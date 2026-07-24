import { GoogleAuth } from 'google-auth-library'
import type { ProjectUserJoinPublicationV1 } from '../../../models/system/project-user-join.model'

export type ProjectUserJoinDeliveryOutcome =
  | 'disabled'
  | 'delivered'
  | 'duplicate'

function configuredTarget() {
  const endpoint = String(
    process.env.FIREUX_SIGNUP_MONITOR_ENDPOINT || ''
  ).trim()
  const audience = String(
    process.env.FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE || ''
  ).trim()
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

export async function publishProjectUserJoinProjection(
  publication: ProjectUserJoinPublicationV1
): Promise<ProjectUserJoinDeliveryOutcome> {
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
    signal: AbortSignal.timeout(8_000),
  })

  if (!response.ok) {
    throw new Error(`Signup monitor receiver returned ${response.status}.`)
  }
  const result = (await response.json()) as { outcome?: unknown }
  return result.outcome === 'duplicate' ? 'duplicate' : 'delivered'
}
