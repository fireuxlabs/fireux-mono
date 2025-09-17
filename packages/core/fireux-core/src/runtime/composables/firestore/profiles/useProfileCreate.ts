// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useCoreUser } from '../CoreUser/useCoreUser'

/**
 * Minimal profile creation:
 * - Always creates a global (ecosystem) profile
 * - If role === 'tenant' → also creates a shallow app mirror
 * - Seeds id/name/avatar from CoreUser (not Firebase Auth)
 * - No defaults: only writes what the caller passes (plus id/name/avatar baseline)
 * - Timestamps/creator are auto-stamped by useFirestoreCreate()
 */
export function useProfileCreate(config: ProfileConfig) {
  const { appId, role } = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()
  const { coreUser } = useCoreUser()

  /**
   * ensure(profileFs): Write minimal profile payload.
   * - Expects Firestore-shaped keys (snake_case if applicable). Use model mappers to convert UI → FS.
   * - Stamping is handled by useFirestoreCreate()
   */
  async function ensure(profile: Record<string, any> = {}) {
    if (!coreUser.value?.id) throw new Error('CoreUser not loaded')
    const uid = coreUser.value.id

    // Global profile
    const base = {
      id: uid,
      name: coreUser.value.display_name || 'User',
      avatar: coreUser.value.avatar || '',
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
