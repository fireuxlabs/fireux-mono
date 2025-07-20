/**
 * Employer Update Composable
 *
 * Handles updates for Employer profiles in the Jobs package.
 * Supports all updateable fields with proper validation and formatting.
 *
 * SINGLE FIELD UPDATES (use Field component):
 * - company_name: string (required) → Molecules/Forms/Firestore/Field → updateCompanyName()
 * - email: string (required) → Molecules/Forms/Firestore/Field → updateEmail()
 * - title: string (optional) → Molecules/Forms/Firestore/Field → updateTitle()
 * - website: string (optional) → Molecules/Forms/Firestore/Field → updateWebsite()
 * - business_license: string (optional) → Molecules/Forms/Firestore/Field → updateBusinessLicense()
 * - tax_id: string (optional) → Molecules/Forms/Firestore/Field → updateTaxId()
 *
 * SPECIALIZED FIELD UPDATES (use custom components):
 * - bio_short: string (optional) → Molecules/Forms/Firestore/Field (textarea) → updateBioShort()
 * - bio_long: string (optional) → Molecules/Forms/Firestore/Field (textarea) → updateBioLong()
 * - business_type: string (optional) → Molecules/Forms/Firestore/Select → updateBusinessType()
 * - employee_count: number (optional) → Molecules/Forms/Firestore/Field (number) → updateEmployeeCount()
 * - years_established: number (optional) → Molecules/Forms/Firestore/Field (number) → updateYearsEstablished()
 * - covers_per_service: number (optional) → Molecules/Forms/Firestore/Field (number) → updateCoversPerService()
 * - annual_revenue: string (optional) → Molecules/Forms/Firestore/Select → updateAnnualRevenue()
 *
 * ARRAY FIELD UPDATES (use ArrayOfStrings component):
 * - specialties: string[] (optional) → Molecules/Forms/Firestore/ArrayOfStrings → updateSpecialties()
 * - cuisine_types: string[] (optional) → Molecules/Forms/Firestore/ArrayOfStrings → updateCuisineTypes()
 * - establishment_type: string[] (optional) → Molecules/Forms/Firestore/ArrayOfStrings → updateEstablishmentType()
 *
 * CHECKBOX UPDATES (use Checkbox component):
 * - verified: boolean (optional) → Molecules/Forms/Firestore/Checkbox → updateVerified()
 *
 * COMPLEX OBJECT UPDATES (use custom components):
 * - locations: CompanyLocation[] (optional) → Custom component → updateLocations()
 * - operating_hours: object (optional) → Custom component → updateOperatingHours()
 * - active_jobs: JobOpening[] (optional) → Custom component → updateActiveJobs()
 * - contacts: CompanyContact[] (optional) → Custom component → updateContacts()
 * - social_media: object (optional) → Custom component → updateSocialMedia()
 */

import { doc, updateDoc } from 'firebase/firestore'

export function useEmployerUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  // Generic function for updating single fields
  const updateSingleField = async (
    field: string,
    value: string | number | boolean
  ) => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const docRef = doc(db, 'employers', user.uid)
    await updateDoc(docRef, {
      [field]: value,
      updated_at: new Date(),
    })
  }

  // Generic function for updating array fields
  const updateArrayField = async (field: string, value: string[]) => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const docRef = doc(db, 'employers', user.uid)
    await updateDoc(docRef, {
      [field]: value,
      updated_at: new Date(),
    })
  }

  // Generic function for updating object fields
  const updateObjectField = async (field: string, value: any) => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const docRef = doc(db, 'employers', user.uid)
    await updateDoc(docRef, {
      [field]: value,
      updated_at: new Date(),
    })
  }

  return {
    // Single field updates
    updateCompanyName: (value: string) =>
      updateSingleField('company_name', value),
    updateEmail: (value: string) => updateSingleField('email', value),
    updateTitle: (value: string) => updateSingleField('title', value),
    updateWebsite: (value: string) => updateSingleField('website', value),
    updateBusinessLicense: (value: string) =>
      updateSingleField('business_license', value),
    updateTaxId: (value: string) => updateSingleField('tax_id', value),
    updateBioShort: (value: string) => updateSingleField('bio_short', value),
    updateBioLong: (value: string) => updateSingleField('bio_long', value),
    updateBusinessType: (value: string) =>
      updateSingleField('business_type', value),
    updateEmployeeCount: (value: number) =>
      updateSingleField('employee_count', value),
    updateYearsEstablished: (value: number) =>
      updateSingleField('years_established', value),
    updateCoversPerService: (value: number) =>
      updateSingleField('covers_per_service', value),
    updateAnnualRevenue: (value: string) =>
      updateSingleField('annual_revenue', value),

    // Array field updates
    updateSpecialties: (value: string[]) =>
      updateArrayField('specialties', value),
    updateCuisineTypes: (value: string[]) =>
      updateArrayField('cuisine_types', value),
    updateEstablishmentType: (value: string[]) =>
      updateArrayField('establishment_type', value),

    // Boolean field updates
    updateVerified: (value: boolean) => updateSingleField('verified', value),

    // Complex object updates
    updateLocations: (value: any) => updateObjectField('locations', value),
    updateOperatingHours: (value: any) =>
      updateObjectField('operating_hours', value),
    updateActiveJobs: (value: any) => updateObjectField('active_jobs', value),
    updateContacts: (value: any) => updateObjectField('contacts', value),
    updateSocialMedia: (value: any) => updateObjectField('social_media', value),
  }
}
