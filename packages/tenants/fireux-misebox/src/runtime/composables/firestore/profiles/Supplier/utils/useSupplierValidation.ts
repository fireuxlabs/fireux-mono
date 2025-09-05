import type { Supplier } from '../../../../../models/profiles/Supplier.model'

export function useSupplierValidation() {
  /**
   * Validate supplier data
   */
  function validateSupplier(supplier: Partial<Supplier>) {
    const errors: string[] = []

    // Required fields
    if (!supplier.business_name?.trim()) {
      errors.push('Business name is required')
    }

    if (!supplier.uid?.trim()) {
      errors.push('User ID is required')
    }

    // Business type validation
    const validBusinessTypes = [
      'farm',
      'distributor',
      'manufacturer',
      'wholesaler',
      'producer',
      'other',
    ]
    if (
      supplier.business_type &&
      !validBusinessTypes.includes(supplier.business_type)
    ) {
      errors.push('Invalid business type')
    }

    // Email validation
    if (supplier.email && !isValidEmail(supplier.email)) {
      errors.push('Invalid email format')
    }

    // Phone validation
    if (supplier.phone && !isValidPhone(supplier.phone)) {
      errors.push('Invalid phone number format')
    }

    // Note: website is not part of the current Supplier model

    // Note: years_in_business, employee_count and payment_terms are not in the current Supplier model

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate business hours format
   */
  function validateBusinessHours(hours: any) {
    const errors: string[] = []
    const validDays = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]

    for (const day of validDays) {
      if (hours[day]) {
        const dayHours = hours[day]
        if (typeof dayHours.is_open !== 'boolean') {
          errors.push(`${day}: is_open must be a boolean`)
        }
        if (dayHours.is_open) {
          if (!dayHours.open || !dayHours.close) {
            errors.push(
              `${day}: open and close times are required when is_open is true`
            )
          }
          if (dayHours.open && dayHours.close && !isValidTime(dayHours.open)) {
            errors.push(`${day}: invalid open time format`)
          }
          if (dayHours.open && dayHours.close && !isValidTime(dayHours.close)) {
            errors.push(`${day}: invalid close time format`)
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Helper function to validate email format
   */
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Helper function to validate phone format
   */
  function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/
    return phoneRegex.test(phone)
  }

  /**
   * Helper function to validate URL format
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Helper function to validate time format (HH:MM)
   */
  function isValidTime(time: string): boolean {
    const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/
    return timeRegex.test(time)
  }

  return {
    validateSupplier,
    validateBusinessHours,
    isValidEmail,
    isValidPhone,
    isValidUrl,
    isValidTime,
  }
}
