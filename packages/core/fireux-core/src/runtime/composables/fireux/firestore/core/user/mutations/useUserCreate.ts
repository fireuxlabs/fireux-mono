import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { AppStorage } from '../../../../../../models/core/app.model'
import { AppUserStorage } from '../../../../../../models/core/user.model'
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
  async function createUser(): Promise<{
    createdCore: boolean
    createdApp: boolean
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
      email: auth.email ?? '',
      avatar: auth.photoURL ?? '',
    })

    // Sign-in should not mutate existing membership/admin roles.
    // Only create app membership when the app-scoped overlay is missing.
    let membershipRole: 'admin' | 'user' = 'user'
    let shouldCreateMembership = true
    let appExists = false
    try {
      const db = useFirestore()
      const [appUserSnap, appSnap] = await Promise.all([
        getDoc(doc(db, AppStorage.collection, appId, AppUserStorage.collection, uid)),
        getDoc(doc(db, AppStorage.collection, appId)),
      ])
      appExists = appSnap.exists()

      if (appUserSnap.exists()) {
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

      const coreAdminOf = Array.isArray((core.snapshot?.data() as any)?.adminOf)
        ? ((core.snapshot?.data() as any)?.adminOf as Array<unknown>)
            .map((id) => String(id ?? '').trim())
            .filter(Boolean)
        : []
      const appAdminIds = Array.isArray((appSnap.data() as any)?.admin_ids)
        ? ((appSnap.data() as any)?.admin_ids as Array<unknown>)
            .map((id) => String(id ?? '').trim())
            .filter(Boolean)
        : []

      // If we do need to create the overlay, preserve admin role only when
      // existing admin mirrors already say this user is an admin.
      const isMirroredAdmin = coreAdminOf.includes(appId) || appAdminIds.includes(uid)

      if (appExists && isMirroredAdmin) {
        membershipRole = 'admin'
        shouldCreateMembership = true
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
      ? await createUserAppMembership(appId, uid, membershipRole)
      : { created: false }

    return { createdCore: core.created, createdApp: membership.created, id: uid }
  }

  return { createUser }
}
