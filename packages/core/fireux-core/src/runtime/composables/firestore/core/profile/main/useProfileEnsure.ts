import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  Profile,
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
    const core = user.coreUser?.value
    if (!core?.id) throw new Error('User not loaded')
    const uid = core.id

    const base: Partial<Profile> = {
      id: uid,
      domain: config.id,
      user: {
        id: uid,
        display_name: core.display_name,
        avatar: core.avatar,
        handle: (core as any)?.handle,
      },
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
