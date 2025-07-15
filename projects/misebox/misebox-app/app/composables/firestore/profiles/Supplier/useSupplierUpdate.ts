/**
 * Supplier Update Composable
 *
 * Handles updates for Supplier profiles in the Misebox package.
 */

import { doc, updateDoc } from 'firebase/firestore'

export function useSupplierUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  // Generic function for updating single fields
  const updateSingleField = async (
    field: string,
    value: string | number | boolean
  ) => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const docRef = doc(db, 'suppliers', user.uid)
    await updateDoc(docRef, {
      [field]: value,
      updated_at: new Date(),
    })
  }

  // Generic function for updating array fields
  const updateArrayField = async (field: string, value: any[]) => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const docRef = doc(db, 'suppliers', user.uid)
    await updateDoc(docRef, {
      [field]: value,
      updated_at: new Date(),
    })
  }

  return {
    // Basic business information
    updateBusinessName: (value: string) =>
      updateSingleField('business_name', value),
    updateEmail: (value: string) => updateSingleField('email', value),
    updateTitle: (value: string) => updateSingleField('title', value),
    updateBioShort: (value: string) => updateSingleField('bio_short', value),
    updateBioLong: (value: string) => updateSingleField('bio_long', value),
    updateBusinessType: (value: string) =>
      updateSingleField('business_type', value),
    updateContactPerson: (value: string) =>
      updateSingleField('contact_person', value),
    updatePhone: (value: string) => updateSingleField('phone', value),
    updateWebsite: (value: string) => updateSingleField('website', value),

    // Business stats
    updateYearsInBusiness: (value: number) =>
      updateSingleField('years_in_business', value),
    updateEmployeeCount: (value: number) =>
      updateSingleField('employee_count', value),
    updateAnnualCapacity: (value: string) =>
      updateSingleField('annual_capacity', value),

    // Pricing and services
    updateBulkDiscounts: (value: boolean) =>
      updateSingleField('bulk_discounts', value),
    updateSeasonalPricing: (value: boolean) =>
      updateSingleField('seasonal_pricing', value),

    // Status fields
    updateVerified: (value: boolean) => updateSingleField('verified', value),
    updateFeatured: (value: boolean) => updateSingleField('featured', value),

    // Array field updates
    updateSpecialties: (value: string[]) =>
      updateArrayField('specialties', value),
    updateQualityStandards: (value: string[]) =>
      updateArrayField('quality_standards', value),
    updateSustainabilityPractices: (value: string[]) =>
      updateArrayField('sustainability_practices', value),
    updateDeliveryMethods: (value: string[]) =>
      updateArrayField('delivery_methods', value),
    updatePaymentTerms: (value: string[]) =>
      updateArrayField('payment_terms', value),
    updateClientTypes: (value: string[]) =>
      updateArrayField('client_types', value),

    // Complex object updates (will need custom components)
    updateProductsOffered: (value: any[]) =>
      updateArrayField('products_offered', value),
    updateCertifications: (value: any[]) =>
      updateArrayField('certifications', value),
    updateActiveClients: (value: any[]) =>
      updateArrayField('active_clients', value),
    updateTestimonials: (value: any[]) =>
      updateArrayField('testimonials', value),
    updateLocations: (value: any[]) => updateArrayField('locations', value),
  }
}
