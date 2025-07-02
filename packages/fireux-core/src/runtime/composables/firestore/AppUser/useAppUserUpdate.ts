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

  async function updateFirstName(firstName: string): Promise<void> {
    await updateAppProfile({ first_name: firstName })
  }

  async function updateMiddleName(middleName: string): Promise<void> {
    await updateAppProfile({ middle_name: middleName })
  }

  async function updateLastName(lastName: string): Promise<void> {
    await updateAppProfile({ last_name: lastName })
  }

  async function updateDisplayName(displayName: string): Promise<void> {
    await updateAppProfile({ display_name: displayName })
  }

  async function updateBio(bio: string): Promise<void> {
    await updateAppProfile({ bio })
  }

  async function updateEmail(email: string): Promise<void> {
    await updateAppProfile({ email })
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

  async function updatePhone(phone: string): Promise<void> {
    await updateAppProfile({ phone })
  }

  async function updateAddress(
    addressUpdate: Partial<AppUser['address']>
  ): Promise<void> {
    // This is a more robust way to update nested address fields
    // You might want to fetch current user data first to merge properly
    await updateAppProfile({
      address: addressUpdate,
    })
  }

  async function updateCity(city: string): Promise<void> {
    await updateAddress({ city })
  }

  async function updateState(state: string): Promise<void> {
    await updateAddress({ state })
  }

  async function updateCountry(country: string): Promise<void> {
    await updateAddress({ country })
  }

  return {
    updateAppProfile,
    updateAvatar,
    updateAvatarFromUrl,
    updateFirstName,
    updateMiddleName,
    updateLastName,
    updateHandle,
    updateDisplayName,
    updateBio,
    updateEmail,
    updatePhone,
    updateAddress,
    updateCity,
    updateState,
    updateCountry,
    updateNotifications,
    updateFollowers,
    updateFollowing,
    updatePreferences,
  }
}
