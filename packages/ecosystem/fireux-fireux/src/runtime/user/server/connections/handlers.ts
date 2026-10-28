import { getCookie, setCookie, readBody, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  opaque,
  requireOpaque,
  requireRecentAuth,
  connectionOrigin,
  requirePeerSecret,
  ConnectionError,
} from 'fireux-core/runtime/user/server/connections/protocol'
import {
  peerBody,
  protectConnectionResponse,
  requireConnectionOrigin,
} from 'fireux-core/runtime/user/server/connections/transport'
import { resolvePostAuthDestination } from 'fireux-core/runtime/user/utils/onboarding-route'
import { resolveConnectionResume } from '../../utils/connection-resume'
import { createConnectionService, connectionPath } from './service'
import { connectionStore, privateConnectionDatabase } from './store'

export function connectionSettings() {
  const raw = useRuntimeConfig().accountConnections as Record<string, unknown>
  return {
    origin: connectionOrigin(raw.origin, import.meta.dev),
    miseboxOrigin: connectionOrigin(raw.miseboxOrigin, import.meta.dev),
    secret: requirePeerSecret(raw.peerSecret),
  }
}
async function actor(event: H3Event, recent = false) {
  const actor = await requireFirebaseBearerUser(event)
  if (actor.decoded.firebase?.tenant)
    throw new ConnectionError(
      403,
      'This Auth account cannot use this connection.'
    )
  if (recent) requireRecentAuth(actor.decoded.auth_time, Date.now())
  return actor
}
export async function listConnections(event: H3Event) {
  protectConnectionResponse(event)
  const { uid } = await actor(event)
  const settings = connectionSettings()
  const snapshot = await privateConnectionDatabase()
    .doc(connectionPath(uid))
    .get()
  const link = snapshot.data()
  return {
    uid,
    connected: Boolean(link),
    localLabel: link?.localLabel || '',
    connectedAt: link?.connectedAt || null,
    miseboxOrigin: settings.miseboxOrigin,
  }
}
export async function connectionCommand(event: H3Event) {
  const config = connectionSettings()
  requireConnectionOrigin(event, config.origin)
  const { uid, decoded } = await actor(event)
  const body = await readBody<Record<string, unknown>>(event)
  const service = createConnectionService(connectionStore())
  switch (body.action) {
    case 'begin': {
      requireRecentAuth(decoded.auth_time, Date.now())
      const binding = opaque()
      const request = await service.beginLink(
        uid,
        String(decoded.email || decoded.name || 'Your FireUX account').slice(
          0,
          254
        ),
        binding
      )
      setCookie(event, `fireux_link_${request}`, binding, {
        httpOnly: true,
        secure: !import.meta.dev,
        sameSite: 'lax',
        path: '/api/account',
        maxAge: 600,
      })
      const resume = resolveConnectionResume(body.resume)
      const query = new URLSearchParams({ request })
      if (resume) query.set('resume', resume)
      return {
        uid,
        destination: `${config.miseboxOrigin}/account/connect?${query}`,
      }
    }
    case 'complete': {
      const request = requireOpaque(body.request)
      const binding = getCookie(event, `fireux_link_${request}`) || ''
      const result = await service.completeLink(request, uid, binding)
      return { uid, ...result }
    }
    case 'disconnect':
      requireRecentAuth(decoded.auth_time, Date.now())
      return { uid, ...(await service.disconnect(uid)) }
    case 'authorize': {
      const state = requireOpaque(body.state)
      const code = await service.authorize(
        uid,
        state,
        String(body.challenge || ''),
        decoded.auth_time
      )
      return {
        uid,
        destination: `${config.miseboxOrigin}/account/fireux/callback?${new URLSearchParams({ state, code, redirect: resolvePostAuthDestination(body.returnTo) })}`,
      }
    }
    default:
      throw new ConnectionError(400, 'Choose a supported account action.')
  }
}
export async function connectionPeer(event: H3Event) {
  const config = connectionSettings()
  const body = await peerBody(event, config.secret)
  const service = createConnectionService(connectionStore())
  switch (body.action) {
    case 'inspect':
      return service.inspectLink(requireOpaque(body.request))
    case 'prove': {
      if (
        typeof body.localUid !== 'string' ||
        !body.localUid ||
        body.localUid.length > 128 ||
        typeof body.localLabel !== 'string' ||
        body.localLabel.length > 254
      )
        throw new ConnectionError(400, 'Invalid account confirmation.')
      return service.proveLink(
        requireOpaque(body.request),
        body.localUid,
        body.localLabel
      )
    }
    case 'preview':
    case 'exchange': {
      const result = await service[body.action](
        requireOpaque(body.code),
        requireOpaque(body.state),
        requireOpaque(body.verifier)
      )
      const hubUser = await getAuth(getAdminApp())
        .getUser(result.hubUid)
        .catch((error) => {
          if (error.code === 'auth/user-not-found')
            throw new ConnectionError(
              403,
              'The FireUX account is unavailable. Use your Misebox sign-in.'
            )
          throw error
        })
      const validAfter = Date.parse(hubUser.tokensValidAfterTime || '')
      if (
        hubUser.disabled ||
        (Number.isFinite(validAfter) && result.authTime * 1000 < validAfter)
      )
        throw new ConnectionError(
          403,
          'The FireUX account is unavailable. Use your Misebox sign-in.'
        )
      return { localUid: result.localUid }
    }
    default:
      throw new ConnectionError(400, 'Unsupported connection request.')
  }
}
