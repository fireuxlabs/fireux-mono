// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: self-create only an unprivileged runtime App membership.

import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { AppStorage } from '../../../../../../models/core/app.model'
import { UserAppStorage } from '../../../../../../models/core/user.model'
import { requireUid } from '../../../utils/useEnsureCommon'
import {
  createCoreUserDocument,
  createUserAppMembership,
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
    return looksLikeEmail(primary) ? primary.split('@')[0]?.trim() || '' : primary
  }

  const fallback = String(email ?? '').trim()
  if (!fallback) {
    const suffix = String(uid ?? '').trim().slice(0, 6)
    return isAnonymous && suffix ? `Guest ${suffix}` : ''
  }
  return looksLikeEmail(fallback) ? fallback.split('@')[0]?.trim() || '' : fallback
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

        const payload = await response.json() as {
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
      avatar: auth.photoURL ?? '',
    })

    // Sign-in should not mutate existing membership/admin roles.
    // Only create app membership when the app-scoped overlay is missing.
    let shouldCreateMembership = true
    let membershipExists = false
    let appExists = false
    try {
      const db = useFirestore()
      const [appUserSnap, appSnap] = await Promise.all([
        getDoc(doc(db, AppStorage.collection, appId, UserAppStorage.collection, uid)),
        getDoc(doc(db, AppStorage.collection, appId)),
      ])
      appExists = appSnap.exists()

      if (appUserSnap.exists()) {
        membershipExists = true
        shouldCreateMembership = false
      }

      if (!appExists) {
        shouldCreateMembership = false
        if (import.meta.dev) {
          console.warn('[useUserCreate] app doc missing; skipping membership create', {
            uid,
            appId,
          })
        }
      }

    } catch (error) {
      if (import.meta.dev) {
        console.warn('[useUserCreate] failed to inspect existing membership role', {
          uid,
          appId,
          error,
        })
      }
    }

    const membership = shouldCreateMembership
      ? await createUserAppMembership(appId, uid, 'user')
      : { created: false }

    const event = appExists && (membershipExists || membership.created)
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
