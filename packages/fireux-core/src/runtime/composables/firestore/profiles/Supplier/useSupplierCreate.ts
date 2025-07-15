import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'

export function useSupplierCreate() {
  const currentUser = useCurrentUser()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  const createSupplier = async (supplierData: any): Promise<string> => {
    if (!currentUser.value?.uid) {
      throw new Error('User must be authenticated to create supplier profile')
    }

    creating.value = true
    error.value = null

    try {
      // Validate required fields
      if (
        !supplierData.business_name ||
        supplierData.business_name.trim().length === 0
      ) {
        throw new Error('Business name is required')
      }

      // Prepare supplier document with defaults
      const supplierDoc = {
        // Basic business info
        business_name: supplierData.business_name?.trim() || '',
        business_type: supplierData.business_type?.trim() || '',
        contact_name: supplierData.contact_name?.trim() || '',
        contact_email:
          supplierData.contact_email?.trim() || currentUser.value.email || '',
        contact_phone: supplierData.contact_phone?.trim() || '',

        // Business description
        business_description: supplierData.business_description?.trim() || '',

        // Location
        business_address: supplierData.business_address?.trim() || '',
        business_location: supplierData.business_location || null,
        delivery_areas: supplierData.delivery_areas || [],

        // Products and services
        product_categories: supplierData.product_categories || [],
        products_offered: supplierData.products_offered || [],
        services_offered: supplierData.services_offered || [],

        // Capacity and pricing
        minimum_order_value: supplierData.minimum_order_value || null,
        maximum_order_capacity: supplierData.maximum_order_capacity || null,
        pricing_structure: supplierData.pricing_structure?.trim() || '',
        bulk_discount_available: supplierData.bulk_discount_available || false,

        // Delivery and logistics
        delivery_options: supplierData.delivery_options || [],
        delivery_schedule: supplierData.delivery_schedule || [],
        lead_time_days: supplierData.lead_time_days || null,

        // Quality and certifications
        certifications: supplierData.certifications || [],
        quality_standards: supplierData.quality_standards || [],
        organic_certified: supplierData.organic_certified || false,
        halal_certified: supplierData.halal_certified || false,
        kosher_certified: supplierData.kosher_certified || false,

        // Business details
        years_in_business: supplierData.years_in_business || null,
        business_registration: supplierData.business_registration?.trim() || '',
        tax_id: supplierData.tax_id?.trim() || '',
        insurance_info: supplierData.insurance_info?.trim() || '',

        // Payment and terms
        payment_terms: supplierData.payment_terms || [],
        payment_methods: supplierData.payment_methods || [],
        credit_terms_available: supplierData.credit_terms_available || false,

        // Communication preferences
        preferred_communication:
          supplierData.preferred_communication?.trim() || 'email',
        response_time_hours: supplierData.response_time_hours || 24,

        // References and portfolio
        references: supplierData.references || [],
        portfolio_items: supplierData.portfolio_items || [],

        // Online presence
        website_url: supplierData.website_url?.trim() || '',
        social_media: supplierData.social_media || {},

        // Availability
        currently_accepting_orders:
          supplierData.currently_accepting_orders || true,
        seasonal_availability: supplierData.seasonal_availability || {},

        // Profile management
        profile_visibility: supplierData.profile_visibility || 'public',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: currentUser.value.uid,
        status: 'active',
      }

      console.log(
        'Supplier create standardized - needs setDocument implementation',
        supplierDoc
      )

      return currentUser.value.uid
    } catch (err: any) {
      error.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to create supplier profile')
      throw error.value
    } finally {
      creating.value = false
    }
  }

  return {
    createSupplier,
    creating,
    error,
  }
}
