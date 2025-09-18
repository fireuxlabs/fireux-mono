import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import type { CoreUser } from '../../../models/core/coreUser.model'
import { useMediaStorage } from '../../firebase/useMediaStorage'

// packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserEnsure.ts
// Simple, core-only ensure. No seeds, no membership, no profiles.
export function useCoreUserEnsure() {
  const db = useFirestore()
  const authUserRef = useCurrentUser()

  async function ensureCoreUser() {
    const user = authUserRef.value
    if (!user?.uid || !user?.email) return

    const ref = doc(db, 'core-users', user.uid)
    const snap = await getDoc(ref)

    // Prefer existing avatar, then auth photoURL; otherwise upload a default into core namespace
    let avatar: string | undefined =
      (snap.exists() ? (snap.data() as any)?.avatar : undefined) ||
      user.photoURL ||
      undefined

    if (!avatar) {
      try {
        const { uploadCoreAvatar } = useMediaStorage()
        // Use a shipped default asset; can be themed per app/ecosystem
        avatar = await uploadCoreAvatar('/img/default-avatar.png', user.uid)
      } catch (e) {
        console.warn(
          '[CoreUser] Default avatar upload failed, falling back to static path:',
          e
        )
        // Final fallback to a static path; never undefined
        avatar = '/img/default-avatar.png'
      }
    }

    // Always update minimal immutable/derived fields; avoid overwriting display_name.
    const basePayload: Partial<CoreUser> = {
      id: user.uid,
      email: user.email,
      avatar,
      updated_at: serverTimestamp() as any,
    }

    // Only set display_name on first creation and only when an auth displayName exists.
    const payload: Partial<CoreUser> = snap.exists()
      ? basePayload
      : {
          ...basePayload,
          ...(user.displayName ? { display_name: user.displayName } : {}),
          created_at: serverTimestamp() as any,
        }

    await setDoc(ref, payload, { merge: true })
  }

  return { ensureCoreUser }
}
