// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts
import { ref } from 'vue'
import { serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'
import { useRuntimeConfig } from 'nuxt/app'
import type {
  ProfileConfig,
  ProfileCreate,
  ProfileBase,
} from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useAppUser } from '../AppUser/useAppUser'
import { useAppUserEnsure } from '../AppUser/useAppUserEnsure'
import useAppUserUpdate from '../AppUser/useAppUserUpdate'
import { useMediaStorage } from '../../firebase/useMediaStorage'
import { useFireUXConfig } from '../../FireUXConfig'

/**
 * Public API: ensureProfile()
 * - Always ensures the ecosystem (global) profile doc exists
 * - If tenancy === 'tennant': also ensures AppUser + app membership + app mirror doc
 * - If tenancy === 'king': stops after global doc (no app writes)
 */
export function useProfileCreate(config: ProfileConfig) {
  // NOTE: Defer Nuxt/VueFire composables until ensureProfile() is invoked
  // to avoid calling useRuntimeConfig()/inject() outside a setup context.
  const currentUser = useCurrentUser()

  const creating = ref(false)
  const createError = ref<Error | null>(null)

  async function ensureProfile(additionalData?: Record<string, any>) {
    // Acquire dependencies within call-time to ensure valid setup context
    const db = useFirestore()
    const rc = useRuntimeConfig()
    const { setDocument, firestoreFetchDoc } = useFirestoreManager()
    const { getDefaultAvatarUrl } = useMediaStorage()
    const { appId } = useFireUXConfig()

    // Normalize tenancy: 'king' | 'tennant'
    let role = (rc.public?.role || (rc.public as any)?.appRole) as
      | string
      | undefined
    if (role === 'tenant') role = 'tennant'
    const tenancy = role || 'king' // default to king if unspecified

    const uid = currentUser.value?.uid
    if (!uid) throw new Error('User is not authenticated')

    creating.value = true
    createError.value = null

    try {
      // --- 1) Ensure ecosystem/global profile doc ---
      // eslint-disable-next-line no-console
      console.log('[ensureProfile] tenancy=%s appId=%s', tenancy, appId)
      // eslint-disable-next-line no-console
      console.log(
        '[ensureProfile] ensuring ecosystem doc for uid=%s in %s',
        uid,
        config.collectionName
      )
      const existsRef = firestoreFetchDoc(config.collectionName, uid)
      if (!existsRef?.value) {
        const avatar =
          (additionalData?.avatar as string | undefined) ??
          currentUser.value?.photoURL ??
          getDefaultAvatarUrl()

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
      }

      // --- 2) If not a tenant app, we’re done (king shouldn’t touch app docs) ---
      if (tenancy !== 'tennant') {
        return 'success' as const
      }

      // --- 3) Tenant: ensure AppUser exists before updating it ---
      const { ensureAppUser } = useAppUserEnsure()
      await ensureAppUser()

      // --- 4) Ensure AppUser.profiles contains this profile type ---
      const { appUser } = useAppUser()
      const { useAppUserUpdateFirestore } = useAppUserUpdate()
      const { updateProfiles } = useAppUserUpdateFirestore()

      const entry = {
        type: config.id, // e.g. 'chef'
        collection: config.collectionName, // e.g. 'chefs'
        is_active: true,
        created_at: new Date().toISOString(),
      }

      const current = appUser.value?.profiles || []
      if (!current.some((p: any) => p.type === entry.type)) {
        await updateProfiles([...current, entry])
      }

      // --- 5) Optional app “mirror” doc (shallow) ---
      if (appId) {
        const mirror = {
          id: uid,
          avatar: currentUser.value?.photoURL ?? getDefaultAvatarUrl(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
        await setDoc(
          doc(db, 'apps', appId, config.collectionName, uid),
          mirror,
          {
            merge: true,
          }
        )
      }

      return 'success' as const
    } catch (err: any) {
      createError.value =
        err instanceof Error
          ? err
          : new Error(
              err?.message || `Failed to ensure ${config.profileType} profile`
            )
      throw createError.value
    } finally {
      creating.value = false
    }
  }

  return {
    ensureProfile,
    creating,
    createError,
  }
}
