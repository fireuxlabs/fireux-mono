// ~/composables/app/useAppUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreUtils } from '../firestore/useFirestoreUtils'
import { validateAppField } from './utils/useAppValidation'
import { formatAppField } from './utils/useAppFormatting'
import type { AppSocialLinks } from './utils/useAppValidation'

/*
 * APP UPDATE COMPOSABLE
 *
 * EDITABLE FIELDS:
 * - description?: string (App description - runtime content)
 * - admin_ids: string[] (List of admin user IDs - user management)
 * - social_links?: object (Social media links - marketing/branding)
 *
 * VALIDATION & FORMATTING:
 * All validation logic is in: ./utils/useAppValidation.ts
 * All formatting logic is in: ./utils/useAppFormatting.ts
 */

export function useAppUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { appId } = useFireUXConfig()

  function useAppUpdateFirestore() {
    // Generic update function with validation and formatting
    const updateAppField = async (field: string, value: any) => {
      try {
        const user = await waitForCurrentUser()
        if (!user) throw new Error('User not authenticated')

        // Validate the field value
        const validationError = validateAppField(field, value)
        if (validationError) {
          throw new Error(validationError)
        }

        // Format the field value
        const formattedValue = formatAppField(field, value)

        // Update Firestore
        const appRef = doc(db, 'apps', appId)
        await updateDoc(appRef, { [field]: formattedValue })

        return { success: true }
      } catch (error) {
        console.error(`Error updating app ${field}:`, error)
        throw error
      }
    }

    // Specific update functions for each editable field
    const updateDescription = async (description: string) => {
      return updateAppField('description', description)
    }

    const updateAdmins = async (adminIds: string[]) => {
      return updateAppField('admin_ids', adminIds)
    }

    const updateSocialLinks = async (socialLinks: AppSocialLinks) => {
      return updateAppField('social_links', socialLinks)
    }

    return {
      updateDescription,
      updateAdmins,
      updateSocialLinks,
      // Generic updater for advanced use
      updateAppField,
    }
  }

  function useAppUpdateState() {
    // State-based updates for app settings that don't persist to Firestore
    // Examples: UI preferences, feature flags, temporary settings, etc.

    const updateAppState = async (state: Record<string, any>) => {
      try {
        console.log('App state updates not yet implemented:', state)
        // TODO: Implement state-based updates when needed
        // This could update Pinia store, local storage, or session storage
        return { success: true }
      } catch (error) {
        console.error('Error updating app state:', error)
        throw error
      }
    }

    return {
      updateAppState,
    }
  }

  return {
    // Direct access to update functions
    ...useAppUpdateFirestore(),
    ...useAppUpdateState(),

    // Grouped access to functions (preferred approach)
    useAppUpdateFirestore,
    useAppUpdateState,
  }
}
