import {
  readBody,
  getQuery,
  getCookie,
  setCookie,
  deleteCookie,
  type H3Event,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  connectionOrigin,
  requirePeerSecret,
  opaque,
  digest,
  requireOpaque,
  requireRecentAuth,
  sealHandoff,
  openHandoff,
  ConnectionError,
} from 'fireux-core/runtime/user/server/connections/protocol'
import {
  callConnectionPeer,
  protectConnectionResponse,
  requireConnectionOrigin,
} from 'fireux-core/runtime/user/server/connections/transport'
import {
  resolveInternalRedirect,
  resolvePostAuthDestination,
} from 'fireux-core/runtime/utils/onboarding-route'

function settings() {
  const runtime = useRuntimeConfig()
  const admin = getAdminApp()
  const projectId =
    admin.options.projectId ||
    (admin.options.credential as { projectId?: string })?.projectId
  if (
    runtime.public.sharedSignIn.enabled !== true ||
    projectId !== 'misebox-78f9c'
  )
    throw new ConnectionError(
      503,
      'Shared sign-in is not available yet. Use your usual Misebox sign-in.'
    )
  return {
    origin: connectionOrigin(
      runtime.accountConnections.origin,
      import.meta.dev
    ),
    hubOrigin: connectionOrigin(
      runtime.accountConnections.hubOrigin,
      import.meta.dev
    ),
    secret: requirePeerSecret(runtime.accountConnections.peerSecret),
  }
}
const cookieOptions = {
  httpOnly: true,
  secure: !import.meta.dev,
  sameSite: 'lax' as const,
  path: '/api/account',
  maxAge: 600,
}

async function requireExistingLocalUser(uid: string) {
  const local = await getAuth(getAdminApp())
    .getUser(uid)
    .catch((error) => {
      if (error.code === 'auth/user-not-found')
        throw new ConnectionError(
          403,
          'Your Misebox account is unavailable. Use your usual sign-in.'
        )
      throw error
    })
  if (local.disabled || local.tenantId)
    throw new ConnectionError(
      403,
      'Your Misebox account is unavailable. Use your usual sign-in.'
    )
  if (
    !(await getRuntimeIdentityFirestore().doc(`users/${local.uid}`).get())
      .exists
  )
    throw new ConnectionError(
      409,
      'Your Misebox profile is unavailable. Use your usual sign-in.'
    )
  return local
}
function browserHandoff(event: H3Event, secret: string, state: string) {
  const handoff = openHandoff(
    secret,
    getCookie(event, `misebox_login_${state}`),
    Date.now()
  )
  if (handoff.state !== state)
    throw new ConnectionError(
      403,
      'This sign-in does not belong to this browser. Start again.'
    )
  return handoff
}
export async function inspectFireuxConnection(event: H3Event) {
  protectConnectionResponse(event)
  const config = settings()
  const query = getQuery(event)
  if (query.state || query.code) {
    const state = requireOpaque(query.state)
    const handoff = browserHandoff(event, config.secret, state)
    const result = await callConnectionPeer<{ localUid: string }>(
      config.hubOrigin,
      config.secret,
      {
        action: 'preview',
        state,
        code: requireOpaque(query.code),
        verifier: handoff.verifier,
      }
    )
    const local = await requireExistingLocalUser(result.localUid)
    return {
      localUid: local.uid,
      returnTo: handoff.returnTo as string,
      localLabel:
        local.email || local.displayName || 'Your connected Misebox account',
    }
  }
  return callConnectionPeer<{ hubLabel: string }>(
    config.hubOrigin,
    config.secret,
    { action: 'inspect', request: requireOpaque(query.request) }
  )
}
export async function fireuxConnectionCommand(event: H3Event) {
  const config = settings()
  requireConnectionOrigin(event, config.origin)
  const body = await readBody<Record<string, unknown>>(event)
  if (body.action === 'prepare') {
    const state = opaque()
    const verifier = opaque()
    const returnTo = resolvePostAuthDestination(body.returnTo)
    // Callback pages and connection endpoints must never become a post-login loop.
    const safeReturn = /^\/(?:account|api)(?:\/|$)/.test(returnTo)
      ? '/dashboard'
      : returnTo
    setCookie(
      event,
      `misebox_login_${state}`,
      sealHandoff(config.secret, {
        state,
        verifier,
        returnTo: safeReturn,
        expires: Date.now() + 600000,
      }),
      cookieOptions
    )
    return {
      destination: `${config.hubOrigin}/account/continue?${new URLSearchParams({ state, challenge: digest(verifier), redirect: safeReturn })}`,
    }
  }
  if (body.action === 'prove') {
    const actor = await requireFirebaseBearerUser(event)
    if (actor.decoded.firebase?.tenant)
      throw new ConnectionError(
        403,
        'This Auth account cannot use this connection.'
      )
    requireRecentAuth(actor.decoded.auth_time, Date.now())
    if (
      !(await getRuntimeIdentityFirestore().doc(`users/${actor.uid}`).get())
        .exists
    )
      throw new ConnectionError(
        409,
        'Finish setting up your Misebox account before connecting it.'
      )
    const request = requireOpaque(body.request)
    await callConnectionPeer(config.hubOrigin, config.secret, {
      action: 'prove',
      request,
      localUid: actor.uid,
      localLabel: String(
        actor.decoded.email || actor.decoded.name || 'Your Misebox account'
      ).slice(0, 254),
    })
    const query = new URLSearchParams({ request })
    const resume = resolveInternalRedirect(body.resume, '')
    if (
      resume &&
      new URL(resume, config.hubOrigin).pathname === '/account/continue'
    )
      query.set('resume', resume)
    return {
      uid: actor.uid,
      destination: `${config.hubOrigin}/account/connect/complete?${query}`,
    }
  }
  if (body.action === 'signin') {
    const state = requireOpaque(body.state)
    const handoff = browserHandoff(event, config.secret, state)
    const response = await callConnectionPeer<{ localUid: string }>(
      config.hubOrigin,
      config.secret,
      {
        action: 'exchange',
        code: requireOpaque(body.code),
        state,
        verifier: handoff.verifier,
      }
    )
    const auth = getAuth(getAdminApp())
    const local = await requireExistingLocalUser(response.localUid)
    const customToken = await auth.createCustomToken(local.uid)
    deleteCookie(event, `misebox_login_${state}`, { path: '/api/account' })
    return { customToken, uid: local.uid, returnTo: handoff.returnTo as string }
  }
  throw new ConnectionError(400, 'Choose a supported account action.')
}
