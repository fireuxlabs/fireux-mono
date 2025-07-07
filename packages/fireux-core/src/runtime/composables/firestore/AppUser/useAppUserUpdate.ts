// ~/composables/useAppUserUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreUtils } from '../useFirestoreUtils'
import type { AppUser } from '../../../models/appUser.model'
import {
  validateSingleField,
  validateBio,
  validatePhone,
  validateFullName,
  validateAddress,
  AppUserSingleField,
} from './utils/useAppUserValidation'
import {
  formatDisplayName,
  formatHandle,
  formatEmail,
  formatBio,
  formatPhone,
  formatFullName,
  formatAddress,
} from './utils/useAppUserFormatting'

/*
 * UPDATEABLE APPUSER PROPERTIES
 * Based on AppUser model interface
 *
 * SINGLE FIELD UPDATES (use SingleField component):
 * - display_name: string (required) → Molecules/Forms/Firestore/SingleField → updateDisplayName()
 * - handle: string (required) → Molecules/Forms/Firestore/SingleField → updateHandle()
 * - email: string (required) → Molecules/Forms/Firestore/SingleField → updateEmail()
 *
 * SPECIALIZED FIELD UPDATES (use custom components):
 * - bio: string (required) → Molecules/Forms/Firestore/TextArea → updateBio()
 * - phone?: string (optional) → Molecules/Forms/Firestore/PhoneInput → updatePhone()
 * - avatar: string (required) → Molecules/Forms/Firestore/AvatarSelection → updateAvatar()
 *
 * MULTI FIELD UPDATES (use MultiField component):
 * - first_name: string (required) → Molecules/Forms/Firestore/MultiField → updateFullName()
 * - middle_name?: string (optional) → Molecules/Forms/Firestore/MultiField → updateFullName()
 * - last_name: string (required) → Molecules/Forms/Firestore/MultiField → updateFullName()
 * - address?: object (optional) → Molecules/Forms/Firestore/SimpleAddress → updateAddress()
 *   - street?: string
 *   - city?: string
 *   - state?: string
 *   - country?: string
 *   - postal_code?: string
 *
 * STATE-BASED UPDATES (use State components):
 * - notifications?: object (optional) → Molecules/Forms/State → updateNotifications()
 *   - enabled: boolean
 *   - types: Array<'email' | 'push' | 'sms'>
 * - preferences?: object (optional) → Molecules/Forms/State → updatePreferences()
 *   - theme: 'light' | 'dark'
 *   - language: string
 *
 * SOCIAL FEATURES (array updates):
 * - followers?: Array<string> (optional) → Molecules/Forms/Firestore/ArrayOfStrings → updateFollowers()
 * - following?: Array<string> (optional) → Molecules/Forms/Firestore/ArrayOfStrings → updateFollowing()
 *
 * NON-UPDATEABLE FIELDS (system managed):
 * - uid: string (system assigned)
 * - created_at: string (system timestamp)
 * - role?: 'user' | 'admin' (admin assigned)
 * - subscription?: object (Stripe webhook managed)
 *
 * VALIDATION & FORMATTING:
 * All validation logic is in: ./utils/useAppUserValidation.ts
 * All formatting logic is in: ./utils/useAppUserFormatting.ts
 *
 * USAGE:
 * const { useAppUserUpdateFirestore } = useAppUserUpdate()
 * const { updateDisplayName, updateHandle, updateBio, updatePhone } = useAppUserUpdateFirestore()
 *
 * // For SingleField components (with validation):
 * <SingleField :update-function="updateDisplayName" />
 * <SingleField :update-function="updateHandle" />
 * <SingleField :update-function="updateEmail" />
 *
 * // For specialized components:
 * <TextArea :update-function="updateBio" />
 * <PhoneInput :update-function="updatePhone" />
 * <AvatarSelection :update-function="updateAvatar" />
 *
 * // For MultiField components:
 * <MultiField :update-function="updateFullName" />
 * <MultiField :update-function="updateAddress" />
 */

export function useAppUserUpdate() {
  const db = useFirestore()
  const storage = getStorage()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { appId } = useFireUXConfig()

  function useAppUserUpdateFirestore() {
    // SINGLE FIELD FIRESTORE UPDATES:
    // Generic function for updating single fields with validation and formatting
    const updateSingleField = async (
      field: AppUserSingleField,
      value: string
    ) => {
      try {
        console.log(`Attempting to update ${field} with value:`, value)

        // Validate the field value
        const validationError = validateSingleField(field, value)
        if (validationError) {
          throw new Error(validationError)
        }

        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        console.log(`User authenticated: ${user.uid}`)
        console.log(`App ID: ${appId}`)

        // Format the value before saving
        let formattedValue: string
        switch (field) {
          case AppUserSingleField.DISPLAY_NAME:
            formattedValue = formatDisplayName(value)
            break
          case AppUserSingleField.HANDLE:
            formattedValue = formatHandle(value)
            break
          case AppUserSingleField.EMAIL:
            formattedValue = formatEmail(value)
            break
          default:
            formattedValue = value.trim()
        }

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        console.log(`Updating document:`, `apps/${appId}/users/${user.uid}`)

        await updateDoc(userRef, {
          [field]: formattedValue,
        })

        console.log(`Successfully updated ${field}`)
        return { success: true }
      } catch (error) {
        console.error(`Error updating ${field}:`, error)
        throw error
      }
    }

    // Specific update functions for each SingleField component
    const updateDisplayName = (value: string) =>
      updateSingleField(AppUserSingleField.DISPLAY_NAME, value)
    const updateHandle = (value: string) =>
      updateSingleField(AppUserSingleField.HANDLE, value)
    const updateEmail = (value: string) =>
      updateSingleField(AppUserSingleField.EMAIL, value)

    // SPECIALIZED FIELD UPDATES (not using SingleField component):
    // Bio update (uses TextArea or specialized bio component)
    const updateBio = async (value: string) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        // Validate using utility function
        const validationError = validateBio(value)
        if (validationError) {
          throw new Error(validationError)
        }

        // Format using utility function
        const formattedValue = formatBio(value)

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, { bio: formattedValue })

        return { success: true }
      } catch (error) {
        console.error('Error updating bio:', error)
        throw error
      }
    }

    // Phone update (uses specialized phone input component)
    const updatePhone = async (value: string) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        // Validate using utility function
        const validationError = validatePhone(value)
        if (validationError) {
          throw new Error(validationError)
        }

        // Format using utility function
        const formattedValue = formatPhone(value)

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, { phone: formattedValue })

        return { success: true }
      } catch (error) {
        console.error('Error updating phone:', error)
        throw error
      }
    }

    // MULTI FIELD FIRESTORE UPDATES:
    // For full name (first_name, middle_name, last_name)
    const updateFullName = async (values: {
      first_name: string
      middle_name?: string
      last_name: string
    }) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        // Validate using utility function
        const validationError = validateFullName(values)
        if (validationError) {
          throw new Error(validationError)
        }

        // Format using utility function
        const formattedValues = formatFullName(values)

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, formattedValues)

        return { success: true }
      } catch (error) {
        console.error('Error updating full name:', error)
        throw error
      }
    }

    // For address fields
    const updateAddress = async (values: {
      street?: string
      city?: string
      state?: string
      country?: string
      postal_code?: string
    }) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        // Validate using utility function
        const validationError = validateAddress(values)
        if (validationError) {
          throw new Error(validationError)
        }

        // Format using utility function
        const formattedValues = formatAddress(values)

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, {
          address: formattedValues,
        })

        return { success: true }
      } catch (error) {
        console.error('Error updating address:', error)
        throw error
      }
    }

    // AVATAR UPDATE:
    const updateAvatar = async (file: File) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        // Upload to Firebase Storage
        const avatarRef = ref(storage, `${appId}/avatars/${user.uid}`)
        await uploadBytes(avatarRef, file)
        const downloadURL = await getDownloadURL(avatarRef)

        // Update Firestore with new avatar URL
        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, {
          avatar: downloadURL,
        })

        return { success: true, avatar: downloadURL }
      } catch (error) {
        console.error('Error updating avatar:', error)
        throw error
      }
    }

    // ARRAY FIELD UPDATES:
    const updateFollowers = async (followers: string[]) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, { followers })

        return { success: true }
      } catch (error) {
        console.error('Error updating followers:', error)
        throw error
      }
    }

    const updateFollowing = async (following: string[]) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, { following })

        return { success: true }
      } catch (error) {
        console.error('Error updating following:', error)
        throw error
      }
    }

    return {
      // Single field update functions (for SingleField components)
      updateDisplayName,
      updateHandle,
      updateEmail,

      // Specialized field update functions (for custom components)
      updateBio,
      updatePhone,

      // Multi field update functions
      updateFullName,
      updateAddress,

      // Avatar update
      updateAvatar,

      // Array field updates
      updateFollowers,
      updateFollowing,

      // Generic single field updater (for advanced use)
      updateSingleField,
    }
  }

  function useAppUserUpdateState() {
    // For state-based updates (notifications, preferences)
    // These don't update Firestore directly, just local state

    const updateNotifications = async (notifications: {
      enabled: boolean
      types: Array<'email' | 'push' | 'sms'>
    }) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, { notifications })

        return { success: true }
      } catch (error) {
        console.error('Error updating notifications:', error)
        throw error
      }
    }

    const updatePreferences = async (preferences: {
      theme: 'light' | 'dark'
      language: string
    }) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, { preferences })

        return { success: true }
      } catch (error) {
        console.error('Error updating preferences:', error)
        throw error
      }
    }

    return {
      updateNotifications,
      updatePreferences,
    }
  }

  return {
    // Direct access to update functions
    ...useAppUserUpdateFirestore(),
    ...useAppUserUpdateState(),

    // Grouped access to functions (preferred approach)
    useAppUserUpdateFirestore,
    useAppUserUpdateState,
  }
}
