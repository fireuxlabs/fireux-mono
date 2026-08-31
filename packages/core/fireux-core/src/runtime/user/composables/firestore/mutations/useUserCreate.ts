// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: self-create only an unprivileged runtime App membership.
// Concurrent edit — 2026-07-20 16:37 CEST — Repo Efficiency Pass 1 of 6: distinguish fresh bootstrap from a failed App-status check.

import { fetchCurrentAppContext } from '../../../../app/composables/currentAppContext'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { requireUid } from '../../../../composables/fireux/firestore/utils/useEnsureCommon'
import {
  createCoreUserDocument,
  createAppUserMembership,
} from '../utils/createHelpers'

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+$/.test(value)
}

function toPublicDisplayNameSeed(
  displayName?: string | null,
  email?: string | null,
  uid?: string | null,
  isAnonymous?: boolean
): string {
  const primary = String(displayName ?? '').trim()
  if (primary) {
    return looksLikeEmail(primary)
      ? primary.split('@')[0]?.trim() || ''
      : primary
  }

  const fallback = String(email ?? '').trim()
  if (!fallback) {
    const suffix = String(uid ?? '')
      .trim()
      .slice(0, 6)
    return isAnonymous && suffix ? `Guest ${suffix}` : ''
  }
  return looksLikeEmail(fallback)
    ? fallback.split('@')[0]?.trim() || ''
    : fallback
}

async function isRuntimeAppInitialized(appId: string): Promise<boolean> {
  const response = await fetch('/api/app/status', {
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`App status check failed (${response.status}).`)
  }

  const payload = (await response.json()) as {
    appId?: unknown
    initialized?: unknown
  }
  if (payload.appId !== appId || typeof payload.initialized !== 'boolean') {
    throw new Error('App status check returned an invalid response.')
  }
  return payload.initialized
}

export function useUserCreate() {
  async function ensureAppUserJoinedEvent(
    auth: Awaited<ReturnType<typeof requireUid>>['auth']
  ): Promise<{ created: boolean; ready: boolean }> {
    const token = await auth.getIdToken()
    let lastError: unknown = null

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch('/api/internal/events/user-joined', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Event endpoint returned ${response.status}`)
        }

        const payload = (await response.json()) as {
          event?: { created?: boolean }
        }
        return {
          created: payload.event?.created === true,
          ready: true,
        }
      } catch (error) {
        lastError = error
      }
    }

    console.warn('[useUserCreate] app user event is not ready', {
      error: lastError,
    })
    return { created: false, ready: false }
  }

  async function createUser(): Promise<{
    createdCore: boolean
    createdApp: boolean
    createdAppEvent: boolean
    appEventReady: boolean
    id: string
  }> {
    const { uid, auth } = await requireUid()
    const fireux = useFireUXConfig()
    const { appId } = fireux
    const core = await createCoreUserDocument(uid, {
      displayName: toPublicDisplayNameSeed(
        auth.displayName,
        auth.email,
        uid,
        auth.isAnonymous
      ),
    })

    // Sign-in should not mutate existing membership/admin roles.
    // Only create app membership when the app-scoped overlay is missing.
    let shouldEnsureMembership = false
    const appContext = await fetchCurrentAppContext(auth)
    if (appContext.appId !== appId) {
      throw new Error(
        '[useUserCreate] Current App context does not match the runtime App.'
      )
    }
    const membershipExists = appContext.membership !== null

    // Config declares the bootstrap/UX intent. The canonical App's persisted
    // self_join_enabled field remains the trusted server enforcement policy.
    // Before that App exists, core account creation must still complete so the
    // developer can initialize it and bootstrap the first administrator.
    if (fireux.selfJoinEnabled) {
      shouldEnsureMembership = await isRuntimeAppInitialized(appId)
    }

    // `ensure-self` creates a missing membership and validates an existing one.
    // Existing governance and Entity relationships remain unchanged.
    const membership = shouldEnsureMembership
      ? await createAppUserMembership(appId, uid, 'user')
      : { created: false }

    const event =
      membershipExists || membership.created
        ? await ensureAppUserJoinedEvent(auth)
        : { created: false, ready: false }

    return {
      createdCore: core.created,
      createdApp: membership.created,
      createdAppEvent: event.created,
      appEventReady: event.ready,
      id: uid,
    }
  }

  return { createUser }
}
