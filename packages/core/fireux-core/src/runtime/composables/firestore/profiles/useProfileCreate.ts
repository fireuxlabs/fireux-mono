import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type {
  ProfileConfig,
  ProfileCreate,
  ProfileBase,
} from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useAppUser } from '../AppUser/useAppUser'
import useAppUserUpdate from '../AppUser/useAppUserUpdate'
import { useMediaStorage } from '../../firebase/useMediaStorage'

/**
 * Generic profile creation composable
 * Provides standardized create functionality for all profile types
 */
export async function useProfileCreate(config: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { setDocument, firestoreFetchDoc } = useFirestoreManager()
  const { getDefaultAvatarUrl } = useMediaStorage()

  const creating = ref(false)
  const createError = ref<Error | null>(null)

  async function createProfile(
    additionalData?: Record<string, any>
  ): Promise<'success'> {
    const uid = currentUser.value?.uid
    if (!uid) throw new Error('User is not authenticated')

    creating.value = true
    createError.value = null

    try {
      // 1) If profile exists, just ensure it's listed in AppUser.profiles
      const existing = await firestoreFetchDoc(config.collectionName, uid)
      const { appUser } = await useAppUser()
      const { useAppUserUpdateFirestore } = useAppUserUpdate()
      const { updateProfiles } = useAppUserUpdateFirestore()

      const entry = {
        type: config.id,
        collection: config.collectionName,
        is_active: true,
        created_at: new Date().toISOString(),
      }

      if (existing) {
        const current = appUser.value?.profiles || []
        if (!current.some((p: any) => p.type === entry.type)) {
          await updateProfiles([...current, entry])
        }
        return 'success'
      }

      // 2) Create a new global profile document (ProfileBase shape)
      const avatar =
        currentUser.value.photoURL ||
        getDefaultAvatarUrl() ||
        '/img/default-avatar.png'

      const profileData: ProfileCreate<ProfileBase> & Record<string, any> = {
        id: uid,
        avatar,
        ...(config.defaultValues || {}),
        ...(additionalData || {}),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }

      await setDocument(config.collectionName, uid, profileData, {
        appScoped: false,
      })

      // 3) Reflect in AppUser.profiles
      const current = appUser.value?.profiles || []
      if (!current.some((p: any) => p.type === entry.type)) {
        await updateProfiles([...current, entry])
      }

      return 'success'
    } catch (err: any) {
      createError.value =
        err instanceof Error
          ? err
          : new Error(
              err?.message || `Failed to create ${config.profileType} profile`
            )
      throw createError.value
    } finally {
      creating.value = false
    }
  }

  return {
    createProfile,
    creating,
    createError,
  }
}
