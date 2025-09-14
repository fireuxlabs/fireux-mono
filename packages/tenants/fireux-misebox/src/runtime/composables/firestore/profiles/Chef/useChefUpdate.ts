// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils'
import type {
  ProfileUpdate,
  ProfileBase as CoreProfileBase,
} from 'fireux-core/runtime/models/profiles/profile.model'
import type { ChefCoreProfile as Chef } from '../../../../models/profiles/Chef.model'

// Fields we never allow to be updated here
const IMMUTABLE_KEYS = new Set(['id', 'created_at'])

export function useChefUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  // Generic, safe field updater
  type UpdatableChef = Chef &
    Pick<CoreProfileBase, 'avatar' | 'id' | 'created_at' | 'updated_at'>
  const updateFields = async (patch: ProfileUpdate<UpdatableChef>) => {
    const user = await waitForCurrentUser()
    if (!user?.uid) throw new Error('User not authenticated')

    // Strip undefined/null and immutable keys
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(patch ?? {})) {
      if (v === undefined || v === null) continue
      if (IMMUTABLE_KEYS.has(k)) continue
      payload[k] = v
    }
    // Always bump updated_at on server
    payload.updated_at = serverTimestamp()

    const ref = doc(db, 'chefs', user.uid)
    await updateDoc(ref, payload)
  }

  // Convenience wrappers (keep types narrow where useful)
  const updateSingle = (field: keyof Chef, value: string | number | boolean) =>
    updateFields({ [field]: value } as ProfileUpdate<UpdatableChef>)

  const updateArray = <K extends keyof Chef>(field: K, value: Chef[K]) =>
    updateFields({ [field]: value } as ProfileUpdate<UpdatableChef>)

  return {
    // Basic profile updates
    updateChefName: (v: string) => updateSingle('chef_name', v),
    updateTitle: (v: string) => updateSingle('title', v),
    updateBioShort: (v: string) => updateSingle('bio_short', v),
    updateBioLong: (v: string) => updateSingle('bio_long', v),
    updateYearsExperience: (v: number) => updateSingle('years_experience', v),

    // Service info
    updateAvailableForHire: (v: boolean) =>
      updateSingle('available_for_hire', v),
    updateHourlyRate: (v: number) => updateSingle('hourly_rate' as any, v),

    // Arrays
    updateSpecialties: (v: string[]) => updateArray('specialties', v),
    updateCuisineExpertise: (v: string[]) =>
      updateArray('cuisine_expertise', v),
    updateCookingStyles: (v: string[]) =>
      updateArray('cooking_styles' as any, v),
    updateServiceTypes: (v: string[]) => updateArray('service_types' as any, v),
    updateSignatureDishes: (v: string[]) =>
      updateArray('signature_dishes' as any, v),
    updateAwards: (v: string[]) => updateArray('awards' as any, v),
    updateCertifications: (v: string[]) =>
      updateArray('certifications' as any, v),
    updatePublishedWorks: (v: string[]) =>
      updateArray('published_works' as any, v),

    // Complex objects / collections
    updateChefExperience: (v: any[]) =>
      updateArray('chef_experience' as any, v),
    updateCulinaryEducation: (v: any[]) =>
      updateArray('culinary_education' as any, v),
    updateRecipes: (v: any[]) => updateArray('recipes' as any, v),
    updateGallery: (v: any[]) => updateArray('gallery' as any, v),
    updateKitchens: (v: Record<string, any>) =>
      updateFields({ kitchens: v } as any),
    updateSocialMedia: (v: Record<string, any>) =>
      updateFields({ social_media: v } as any),
    updateLocations: (v: any[]) => updateArray('locations' as any, v),

    // Escape hatch for batching arbitrary changes (already safe)
    updateFields,
  }
}
