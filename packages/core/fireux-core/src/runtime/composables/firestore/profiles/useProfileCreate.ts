// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreCreate } from '../useFirestoreCreate'

/**
 * Minimal profile creation:
 * - Always creates a global (ecosystem) profile
 * - If role === 'tenant' → also creates a shallow app mirror
 * - No defaults: only writes what the caller passes (plus id/name/avatar baseline)
 * - Timestamps/creator are auto-stamped by useFirestoreCreate()
 */
export function useProfileCreate(config: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { appId, role } = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()

  /**
   * ensure(profileFs): Write minimal profile payload.
   * - Expects Firestore-shaped keys (snake_case if applicable). Use model mappers to convert UI → FS.
   * - Stamping is handled by useFirestoreCreate()
   */
  async function ensure(profile: Record<string, any> = {}) {
    if (!currentUser.value?.uid) throw new Error('User not authenticated')
    const uid = currentUser.value.uid

    // Global profile
    const base = {
      id: uid,
      name: currentUser.value.displayName || currentUser.value.email,
      avatar: '',
    }
    await setDocument(config.collectionName, uid, { ...base, ...profile })

    // Tenant mirror (optional)
    if (role === 'tenant' && appId) {
      await setDocument(`apps/${appId}/${config.collectionName}`, uid, {
        ...base,
        ...profile,
      })
    }

    return 'success' as const
  }

  return { ensure }
}
