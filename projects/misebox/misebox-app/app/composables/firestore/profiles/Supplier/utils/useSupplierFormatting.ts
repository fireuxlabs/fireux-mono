import type { Supplier } from '../../../../../models/Supplier.model'

export function useSupplierFormatting() {
  /**
   * Format supplier data before saving
   */
  function formatSupplierData(supplier: Partial<Supplier>): Partial<Supplier> {
    const formatted: Partial<Supplier> = { ...supplier }

    // Format business name
    if (formatted.business_name) {
      formatted.business_name = formatted.business_name.trim()
    }

    // Format display name
    if (formatted.display_name) {
      formatted.display_name = formatted.display_name.trim()
    }

    // Format contact person
    if (formatted.contact_person) {
      formatted.contact_person = formatted.contact_person.trim()
    }

    // Format email
    if (formatted.email) {
      formatted.email = formatted.email.toLowerCase().trim()
    }

    // Format phone
    if (formatted.phone) {
      formatted.phone = formatted.phone.replace(/\D/g, '') // Remove non-digits
    }

    // Format website URL
    if (formatted.website_url) {
      formatted.website_url = formatUrl(formatted.website_url)
    }

    // Format business address
    if (formatted.business_address) {
      formatted.business_address = {
        ...formatted.business_address,
        street_address: formatted.business_address.street_address?.trim(),
        city: formatted.business_address.city?.trim(),
        state: formatted.business_address.state?.trim().toUpperCase(),
        zip_code: formatted.business_address.zip_code?.trim(),
        country: formatted.business_address.country?.trim() || 'US',
      }
    }

    // Format arrays (remove empty strings and duplicates)
    if (formatted.product_categories) {
      formatted.product_categories = formatStringArray(
        formatted.product_categories
      )
    }
    if (formatted.specialties) {
      formatted.specialties = formatStringArray(formatted.specialties)
    }
    if (formatted.dietary_categories) {
      formatted.dietary_categories = formatStringArray(
        formatted.dietary_categories
      )
    }
    if (formatted.customer_types) {
      formatted.customer_types = formatStringArray(formatted.customer_types)
    }
    if (formatted.payment_methods) {
      formatted.payment_methods = formatStringArray(formatted.payment_methods)
    }

    return formatted
  }

  /**
   * Format supplier business name for display
   */
  function formatBusinessName(supplier: Supplier): string {
    return supplier.display_name || supplier.business_name || 'Supplier'
  }

  /**
   * Format supplier business type for display
   */
  function formatBusinessType(supplier: Supplier): string {
    if (!supplier.business_type) return 'Business'

    const typeMap: Record<string, string> = {
      restaurant: 'Restaurant',
      catering: 'Catering Service',
      food_truck: 'Food Truck',
      grocery: 'Grocery Store',
      distributor: 'Food Distributor',
      farm: 'Farm',
      processor: 'Food Processor',
      wholesaler: 'Wholesale Supplier',
    }

    return typeMap[supplier.business_type] || supplier.business_type
  }

  /**
   * Format business address for display
   */
  function formatBusinessAddress(supplier: Supplier): string {
    if (!supplier.business_address) return 'Address not provided'

    const addr = supplier.business_address
    return (
      addr.formatted_address ||
      `${addr.street_address}, ${addr.city}, ${addr.state} ${addr.zip_code}`
    )
  }

  /**
   * Format delivery options for display
   */
  function formatDeliveryOptions(supplier: Supplier): string[] {
    if (!supplier.delivery_options) return ['Delivery options not specified']

    const options: string[] = []
    if (supplier.delivery_options.self_delivery) options.push('Self-delivery')
    if (supplier.delivery_options.third_party_delivery)
      options.push('Third-party delivery')
    if (supplier.delivery_options.pickup_available)
      options.push('Pickup available')

    return options.length > 0 ? options : ['No delivery options available']
  }

  /**
   * Format business hours for display
   */
  function formatBusinessHours(supplier: Supplier): string {
    if (!supplier.business_hours) return 'Hours not specified'

    const openDays = Object.entries(supplier.business_hours)
      .filter(([_, hours]) => hours?.is_open)
      .map(
        ([day, hours]) =>
          `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours!.open} - ${hours!.close}`
      )

    return openDays.length > 0 ? openDays.join(', ') : 'Currently closed'
  }

  /**
   * Format minimum order value
   */
  function formatMinimumOrder(supplier: Supplier): string {
    if (!supplier.delivery_options?.minimum_order_value)
      return 'No minimum order'

    return `$${supplier.delivery_options.minimum_order_value} minimum order`
  }

  /**
   * Format business status for display
   */
  function formatBusinessStatus(supplier: Supplier): string {
    switch (supplier.business_status) {
      case 'active':
        return 'Active'
      case 'seasonal':
        return 'Seasonal'
      case 'temporarily_closed':
        return 'Temporarily Closed'
      case 'permanently_closed':
        return 'Permanently Closed'
      default:
        return 'Status Unknown'
    }
  }

  /**
   * Format verification status for display
   */
  function formatVerificationStatus(supplier: Supplier): string {
    switch (supplier.verification_status) {
      case 'verified':
        return 'Verified Supplier'
      case 'pending':
        return 'Verification Pending'
      case 'rejected':
        return 'Verification Rejected'
      default:
        return 'Not Verified'
    }
  }

  /**
   * Helper function to format URL
   */
  function formatUrl(url: string): string {
    const trimmed = url.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  /**
   * Helper function to format string arrays
   */
  function formatStringArray(arr: string[]): string[] {
    return [
      ...new Set(arr.filter((item) => item?.trim()).map((item) => item.trim())),
    ]
  }

  return {
    formatSupplierData,
    formatBusinessName,
    formatBusinessType,
    formatBusinessAddress,
    formatDeliveryOptions,
    formatBusinessHours,
    formatMinimumOrder,
    formatBusinessStatus,
    formatVerificationStatus,
  }
}
