import type { Employer } from '../../../../../models/profiles/Employer.model'

export function useEmployerValidation() {
  // Validate company name
  const validateCompanyName = (
    name: string
  ): { isValid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Company name is required' }
    }
    if (name.trim().length < 2) {
      return {
        isValid: false,
        error: 'Company name must be at least 2 characters long',
      }
    }
    if (name.length > 100) {
      return {
        isValid: false,
        error: 'Company name must be less than 100 characters',
      }
    }
    return { isValid: true }
  }

  // Validate email
  const validateEmail = (
    email: string
  ): { isValid: boolean; error?: string } => {
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'Email is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }

    return { isValid: true }
  }

  // Validate business type
  const validateBusinessType = (
    type: string
  ): { isValid: boolean; error?: string } => {
    const validTypes = [
      'restaurant',
      'hotel',
      'catering',
      'food_service',
      'retail',
      'other',
    ]

    if (type && !validTypes.includes(type)) {
      return {
        isValid: false,
        error: 'Please select a valid business type',
      }
    }

    return { isValid: true }
  }

  // Validate employee count
  const validateEmployeeCount = (
    count: number
  ): { isValid: boolean; error?: string } => {
    if (count !== undefined && count < 0) {
      return {
        isValid: false,
        error: 'Employee count cannot be negative',
      }
    }

    if (count !== undefined && count > 10000) {
      return {
        isValid: false,
        error: 'Employee count seems unreasonably high',
      }
    }

    return { isValid: true }
  }

  // Validate years established
  const validateYearsEstablished = (
    years: number
  ): { isValid: boolean; error?: string } => {
    if (years !== undefined && years < 0) {
      return {
        isValid: false,
        error: 'Years established cannot be negative',
      }
    }

    if (years !== undefined && years > 200) {
      return {
        isValid: false,
        error: 'Years established seems unreasonably high',
      }
    }

    return { isValid: true }
  }

  // Validate website URL
  const validateWebsite = (
    website: string
  ): { isValid: boolean; error?: string } => {
    if (!website || website.trim().length === 0) {
      return { isValid: true } // Website is optional
    }

    try {
      new URL(website)
      return { isValid: true }
    } catch {
      return {
        isValid: false,
        error: 'Please enter a valid website URL',
      }
    }
  }

  // Validate specialties
  const validateSpecialties = (
    specialties: string[]
  ): { isValid: boolean; error?: string } => {
    if (!specialties || !Array.isArray(specialties)) {
      return { isValid: true } // Specialties are optional
    }

    if (specialties.length > 10) {
      return {
        isValid: false,
        error: 'Maximum 10 specialties allowed',
      }
    }

    for (const specialty of specialties) {
      if (typeof specialty !== 'string' || specialty.trim().length === 0) {
        return {
          isValid: false,
          error: 'All specialties must be non-empty strings',
        }
      }
    }

    return { isValid: true }
  }

  // Validate complete employer data
  const validateEmployerData = (
    data: Partial<Employer>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate required fields
    const requiredValidations = [
      validateCompanyName(data.company_name || ''),
      validateEmail(data.email || ''),
    ]

    requiredValidations.forEach((result) => {
      if (!result.isValid && result.error) {
        errors.push(result.error)
      }
    })

    // Validate optional fields
    const optionalValidations = [
      { field: data.business_type, validator: validateBusinessType },
      { field: data.website, validator: validateWebsite },
      { field: data.specialties, validator: validateSpecialties },
    ]

    optionalValidations.forEach(({ field, validator }) => {
      if (field !== undefined) {
        const result = validator(field as any)
        if (!result.isValid && result.error) {
          errors.push(result.error)
        }
      }
    })

    // Validate numeric fields
    if (data.employee_count !== undefined) {
      const result = validateEmployeeCount(data.employee_count)
      if (!result.isValid && result.error) {
        errors.push(result.error)
      }
    }

    if (data.years_established !== undefined) {
      const result = validateYearsEstablished(data.years_established)
      if (!result.isValid && result.error) {
        errors.push(result.error)
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  return {
    validateCompanyName,
    validateEmail,
    validateBusinessType,
    validateEmployeeCount,
    validateYearsEstablished,
    validateWebsite,
    validateSpecialties,
    validateEmployerData,
  }
}
