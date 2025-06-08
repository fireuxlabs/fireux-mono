// ~/composables/useAppUserUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { AppUserProfile } from '../../../models/appUser.model'

export function useAppUserUpdate() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { tenantId } = useFireUXConfig()

  async function updateAppProfile(
    fields: Partial<AppUserProfile>
  ): Promise<void> {
    if (!currentUser.value) throw new Error('No authenticated user.')
    const profileRef = doc(db, `users/${currentUser.value.uid}/apps`, tenantId)
    await updateDoc(profileRef, fields)
  }

  async function updateAvatar(avatarUrl: string): Promise<void> {
    await updateAppProfile({ avatar: avatarUrl })
  }

  async function updateHandle(newHandle: string): Promise<void> {
    await updateAppProfile({ handle: newHandle })
  }

  async function updateDisplayName(displayName: string): Promise<void> {
    await updateAppProfile({ display_name: displayName })
  }

  async function updateBio(bio: string): Promise<void> {
    await updateAppProfile({ bio })
  }

  return {
    updateAppProfile,
    updateAvatar,
    updateHandle,
    updateDisplayName,
    updateBio,
  }
}
