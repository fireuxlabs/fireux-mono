import type { Supplier } from '../../../../../models/Supplier.model'

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
      'restaurant',
      'catering',
      'food_truck',
      'grocery',
      'distributor',
      'farm',
      'processor',
      'wholesaler',
    ]
    if (
      supplier.business_type &&
      !validBusinessTypes.includes(supplier.business_type)
    ) {
      errors.push('Invalid business type')
    }

    // Email validation
    if (supplier.email && !isValidEmail(supplier.email)) {
      errors.push('Invalid email address')
    }

    // Phone validation
    if (supplier.phone && !isValidPhone(supplier.phone)) {
      errors.push('Invalid phone number')
    }

    // Business address validation
    if (supplier.business_address) {
      if (!supplier.business_address.street_address?.trim()) {
        errors.push('Street address is required for business address')
      }
      if (!supplier.business_address.city?.trim()) {
        errors.push('City is required for business address')
      }
      if (!supplier.business_address.state?.trim()) {
        errors.push('State is required for business address')
      }
      if (!supplier.business_address.zip_code?.trim()) {
        errors.push('ZIP code is required for business address')
      }
    }

    // Payment terms validation
    const validPaymentTerms = [
      'net_30',
      'net_15',
      'net_7',
      'cash_on_delivery',
      'prepaid',
    ]
    if (
      supplier.payment_terms &&
      !validPaymentTerms.includes(supplier.payment_terms)
    ) {
      errors.push('Invalid payment terms')
    }

    // Business status validation
    const validStatuses = [
      'active',
      'seasonal',
      'temporarily_closed',
      'permanently_closed',
    ]
    if (
      supplier.business_status &&
      !validStatuses.includes(supplier.business_status)
    ) {
      errors.push('Invalid business status')
    }

    // Verification status validation
    const validVerificationStatuses = ['pending', 'verified', 'rejected']
    if (
      supplier.verification_status &&
      !validVerificationStatuses.includes(supplier.verification_status)
    ) {
      errors.push('Invalid verification status')
    }

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
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  /**
   * Helper function to validate time format (HH:MM)
   */
  function isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  return {
    validateSupplier,
    validateBusinessHours,
    isValidEmail,
    isValidPhone,
    isValidTime,
  }
}
