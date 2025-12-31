import { ref } from 'vue'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type {
  AppProfileBase,
  CoreProfileBase,
  ProfileConfig,
} from '../../../../../../models/core/profile.model'
import type { ProfileRefs } from '../fetch/useProfileFetch'

type UpdateResult = 'success'
type UpdateScope = 'auto' | 'core' | 'app'

export function useProfileUpdate<
  TCore extends CoreProfileBase = CoreProfileBase,
  TApp extends AppProfileBase = AppProfileBase,
>(profileRefs: ProfileRefs<TCore, TApp>, config: ProfileConfig) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId, role } = useFireUXConfig()

  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  const isTenant = role === 'tenant' && !!appId

  const ensureId = (explicit?: string | null) => {
    const trimmed = explicit?.trim()
    if (trimmed) return trimmed

    const coreId = profileRefs.coreProfile.value?.id
    if (coreId) return coreId

    const appIdCandidate = (
      profileRefs.appProfile.value as { id?: string } | null | undefined
    )?.id
    if (appIdCandidate) return appIdCandidate

    throw new Error(
      `[useProfileUpdate] Missing profile id for ${config.collectionName}`
    )
  }

  const updateCoreProfile = async (
    partial: Partial<TCore>,
    explicitId?: string
  ) => {
    const id = ensureId(explicitId)
    await updateDocument(config.collectionName, id, partial)
  }

  const updateAppProfile = async (
    partial: Partial<TApp>,
    explicitId?: string
  ) => {
    if (!appId) {
      throw new Error(
        '[useProfileUpdate] Missing appId for tenant profile update'
      )
    }
    const id = ensureId(explicitId)
    const collection = `apps/${appId}/${config.collectionName}`
    await updateDocument(collection, id, partial)
  }

  const updateProfile = async (
    partial: any,
    options: { scope?: UpdateScope; id?: string } = {}
  ): Promise<UpdateResult> => {
    const { scope = 'auto', id } = options
    updating.value = true
    updateError.value = null

    try {
      if (scope === 'core') {
        await updateCoreProfile(partial, id)
      } else if (scope === 'app') {
        await updateAppProfile(partial, id)
      } else if (isTenant) {
        await updateAppProfile(partial, id)
      } else {
        await updateCoreProfile(partial, id)
      }

      return 'success'
    } catch (error) {
      updateError.value = error as Error
      throw error
    } finally {
      updating.value = false
    }
  }

  return {
    updateProfile,
    updateCoreProfile,
    updateAppProfile,
    updating,
    updateError,
  }
}
