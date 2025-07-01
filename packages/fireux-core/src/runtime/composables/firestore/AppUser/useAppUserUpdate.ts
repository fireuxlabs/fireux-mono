// ~/composables/useAppUserUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreUtils } from '../useFirestoreUtils'
import type { AppUser } from '../../../models/appUser.model'

export function useAppUserUpdate() {
  const db = useFirestore()
  const storage = getStorage()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { appId } = useFireUXConfig()

  async function updateAppProfile(fields: Partial<AppUser>): Promise<void> {
    const currentUser = await waitForCurrentUser()

    const profileRef = doc(db, `apps/${appId}/users/${currentUser!.uid}`)
    await updateDoc(profileRef, fields)
  }

  async function updateAvatar(avatarFile: File): Promise<void> {
    const currentUser = await waitForCurrentUser()

    // Store app-specific avatar in: {appId}/users/{userId}/avatar
    const avatarPath = `${appId}/users/${currentUser!.uid}/avatar`
    const avatarRef = ref(storage, avatarPath)

    // Upload the file
    await uploadBytes(avatarRef, avatarFile)

    // Get the download URL
    const avatarUrl = await getDownloadURL(avatarRef)

    // Update the AppUser document with the new avatar URL
    await updateAppProfile({ avatar: avatarUrl })
  }

  async function updateAvatarFromUrl(avatarUrl: string): Promise<void> {
    // For cases where you want to set avatar from an existing URL (e.g., copying from CoreUser)
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
    updateAvatarFromUrl,
    updateHandle,
    updateDisplayName,
    updateBio,
    updateNotifications,
    updateFollowers,
    updateFollowing,
    updatePreferences,
  }
}
