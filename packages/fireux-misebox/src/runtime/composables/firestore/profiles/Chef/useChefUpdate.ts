/**
 * Chef Update Composable
 *
 * Handles updates for Chef profiles in the Misebox package.
 * Note: Chef is different from Professional - a chef interacts with kitchens and recipes.
 */

import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

// Import the useFirestoreUtils from fireux-core
declare global {
  function useFirestoreUtils(): {
    waitForCurrentUser: () => Promise<any>
  }
}

export function useChefUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  // Generic function for updating any field
  const updateField = async (field: string, value: any) => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const docRef = doc(db, 'chefs', user.uid)
    await updateDoc(docRef, {
      [field]: value,
      updated_at: new Date(),
    })
  }

  // Wrapper for single field updates with type safety
  const updateSingleField = async (
    field: string,
    value: string | number | boolean
  ) => updateField(field, value)

  // Wrapper for array field updates with type safety
  const updateArrayField = async (field: string, value: any[]) =>
    updateField(field, value)

  return {
    // Basic profile updates
    updateChefName: (value: string) => updateSingleField('chef_name', value),
    updateTitle: (value: string) => updateSingleField('title', value),
    updateBioShort: (value: string) => updateSingleField('bio_short', value),
    updateBioLong: (value: string) => updateSingleField('bio_long', value),
    updateYearsExperience: (value: number) =>
      updateSingleField('years_experience', value),

    // Service information
    updateAvailableForHire: (value: boolean) =>
      updateSingleField('available_for_hire', value),
    updateHourlyRate: (value: number) =>
      updateSingleField('hourly_rate', value),

    // Array field updates
    updateSpecialties: (value: string[]) =>
      updateArrayField('specialties', value),
    updateCuisineExpertise: (value: string[]) =>
      updateArrayField('cuisine_expertise', value),
    updateCookingStyles: (value: string[]) =>
      updateArrayField('cooking_styles', value),
    updateServiceTypes: (value: string[]) =>
      updateArrayField('service_types', value),
    updateSignatureDishes: (value: string[]) =>
      updateArrayField('signature_dishes', value),
    updateAwards: (value: string[]) => updateArrayField('awards', value),
    updateCertifications: (value: string[]) =>
      updateArrayField('certifications', value),
    updatePublishedWorks: (value: string[]) =>
      updateArrayField('published_works', value),

    // Complex object updates (will need custom components)
    updateChefExperience: (value: any[]) =>
      updateArrayField('chef_experience', value),
    updateCulinaryEducation: (value: any[]) =>
      updateArrayField('culinary_education', value),
    updateRecipes: (value: any[]) => updateArrayField('recipes', value),
    updateGallery: (value: any[]) => updateArrayField('gallery', value),
    updateKitchens: (value: any) => updateSingleField('kitchens', value),
    updateSocialMedia: (value: any) => updateSingleField('social_media', value),
    updateLocations: (value: any[]) => updateArrayField('locations', value),
  }
}
