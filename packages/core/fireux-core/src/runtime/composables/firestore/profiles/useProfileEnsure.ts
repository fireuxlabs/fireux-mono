import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useUser } from '../user/useUser'

export function useProfileEnsure(config: ProfileConfig) {
  const { appId, role } = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()
  const { user } = useUser()

  async function ensure(profile: Record<string, any> = {}) {
    if (!user.value?.id) throw new Error('User not loaded')
    const uid = user.value.id
    const core = user.value.core

    const base = {
      id: uid,
      display_name: core?.display_name || 'User',
      avatar: core?.avatar || '',
    }

    await setDocument(config.collectionName, uid, { ...base, ...profile })

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
