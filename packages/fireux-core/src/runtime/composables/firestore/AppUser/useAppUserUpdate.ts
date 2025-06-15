// ~/composables/useAppUserUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreUtils } from '../useFirestoreUtils'
import type { AppUser } from '../../../models/appUser.model'

export function useAppUserUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { appId } = useFireUXConfig()

  async function updateAppProfile(fields: Partial<AppUser>): Promise<void> {
    const currentUser = await waitForCurrentUser()

    const profileRef = doc(db, `apps/${appId}/users/${currentUser!.uid}`)
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

  async function updateNotifications(
    notifications: AppUser['notifications']
  ): Promise<void> {
    await updateAppProfile({ notifications })
  }

  async function updateFollowers(
    followers: AppUser['followers']
  ): Promise<void> {
    await updateAppProfile({ followers })
  }

  async function updateFollowing(
    following: AppUser['following']
  ): Promise<void> {
    await updateAppProfile({ following })
  }

  async function updatePreferences(
    preferences: AppUser['preferences']
  ): Promise<void> {
    await updateAppProfile({ preferences })
  }

  return {
    updateAppProfile,
    updateAvatar,
    updateHandle,
    updateDisplayName,
    updateBio,
    updateNotifications,
    updateFollowers,
    updateFollowing,
    updatePreferences,
  }
}
