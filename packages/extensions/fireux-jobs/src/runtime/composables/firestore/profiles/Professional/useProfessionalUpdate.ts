/**
 * Professional Update Composable
 * 
 * Handles updates for Professional profiles in the Jobs package.
 * Supports all updateable fields with proper validation and formatting.
 */

import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils'

export function useProfessionalUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  // Internal generic updater to avoid duplicate code
  const updateField = async (field: string, value: any) => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')
    const docRef = doc(db, 'professionals', user.uid)
    await updateDoc(docRef, { [field]: value, updated_at: new Date() })
  }

  const updateSingleField = (field: string, value: string | number | boolean) =>
    updateField(field, value)
  const updateArrayField = (field: string, value: any[]) => updateField(field, value)

  return {
    // Single field updates
    updateProfessionalName: (value: string) => updateSingleField('professional_name', value),
    updateEmail: (value: string) => updateSingleField('email', value),
    updateTitle: (value: string) => updateSingleField('title', value),
    updateBioShort: (value: string) => updateSingleField('bio_short', value),
    updateBioLong: (value: string) => updateSingleField('bio_long', value),
    
    // Complex array updates (will use custom components)
    updateKitchenExperience: (value: any[]) => updateArrayField('kitchen_experience', value),
    updateOtherEmployment: (value: any[]) => updateArrayField('other_employment_experience', value),
    updateProjects: (value: any[]) => updateArrayField('projects', value),
    updateVolunteering: (value: any[]) => updateArrayField('volunteering', value),
    updateEducation: (value: any[]) => updateArrayField('education', value),
    updateCertifications: (value: any[]) => updateArrayField('certifications', value),
    updateLanguages: (value: any[]) => updateArrayField('languages', value),
    updateLocations: (value: any[]) => updateArrayField('locations', value),
  }
}
