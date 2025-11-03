import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import { ensureDoc } from '../../../utils/ensureCommon.ts'
import { useUser } from '../../user/useUser.ts'

/**
 * Ensure profile documents exist (core + optional app overlay).
 * - Creates only if missing; never overwrites.
 */
export function useProfileEnsure(config: ProfileConfig) {
  const { isTenant, appId } = useFireUXConfig()

  const { user } = useUser()

  const ensure = async (profile: Record<string, unknown> = {}) => {
    if (!user.value?.id) throw new Error('User not loaded')
    const uid = user.value.id

    const base: Partial<ProfileBase> = {
      id: uid,
      display_name: user.value.display_name || uid,
      avatar: user.value.avatar || '',
    }

    const createdCore = await ensureDoc(config.collectionName, uid, {
      ...base,
      ...profile,
    })

    const appResult =
      isTenant && appId
        ? await ensureDoc(`apps/${appId}/${config.collectionName}`, uid, {
            ...base,
            ...profile,
          })
        : { created: false }

    return {
      createdCore: createdCore.created,
      createdApp: appResult.created,
    } as const
  }

  return { ensure }
}
