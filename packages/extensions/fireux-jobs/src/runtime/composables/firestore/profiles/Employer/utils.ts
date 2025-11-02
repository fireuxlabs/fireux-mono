export function useEmployerFormatting() {
  const formatBusinessType = (type: string): string => {
    const typeMap: Record<string, string> = {
      restaurant: 'Restaurant',
      hotel: 'Hotel',
      catering: 'Catering Company',
      food_service: 'Food Service',
      retail: 'Retail',
      other: 'Other',
    }
    return typeMap[type] || type
  }

  const formatEmployeeCount = (count: number): string => {
    if (count === 1) return '1 employee'
    if (count < 50) return `${count} employees`
    if (count < 100) return `${count} employees`
    if (count < 500) return `${count} employees`
    if (count < 1000) return `${count} employees`
    return `${Math.round(count / 100) * 100}+ employees`
  }

  const formatYearsEstablished = (years: number): string => {
    if (years === 1) return '1 year in business'
    if (years < 5) return `${years} years in business`
    if (years < 10) return `${years} years established`
    if (years < 25) return `${years} years established`
    if (years < 50) return `${years}+ years established`
    return `${years}+ years of heritage`
  }

  const formatAnnualRevenue = (revenue: string): string => {
    const revenueMap: Record<string, string> = {
      under_100k: 'Under CHF 100K',
      '100k_500k': 'CHF 100K - 500K',
      '500k_1m': 'CHF 500K - 1M',
      '1m_5m': 'CHF 1M - 5M',
      '5m_10m': 'CHF 5M - 10M',
      over_10m: 'Over CHF 10M',
      undisclosed: 'Revenue undisclosed',
    }
    return revenueMap[revenue] || revenue
  }

  const formatCoversPerService = (covers: number): string => {
    if (covers < 50) return `${covers} covers per service`
    if (covers < 100) return `${covers} covers per service`
    if (covers < 200) return `${covers} covers per service`
    if (covers < 500) return `${covers} covers per service`
    return `${covers}+ covers per service`
  }

  const formatSpecialties = (specialties: string[]): string => {
    if (!specialties || specialties.length === 0) return 'No specialties listed'
    if (specialties.length === 1) return specialties[0] || ''
    if (specialties.length === 2) return specialties.join(' & ')
    if (specialties.length <= 4) return specialties.join(', ')
    return `${specialties.slice(0, 3).join(', ')} & ${specialties.length - 3} more`
  }

  const formatCuisineTypes = (cuisines: string[]): string => {
    if (!cuisines || cuisines.length === 0) return 'All cuisines'
    if (cuisines.length === 1) return cuisines[0] || ''
    if (cuisines.length === 2) return cuisines.join(' & ')
    if (cuisines.length <= 3) return cuisines.join(', ')
    return `${cuisines.slice(0, 2).join(', ')} & ${cuisines.length - 2} more`
  }

  const formatEstablishmentTypes = (types: string[]): string => {
    if (!types || types.length === 0) return 'Multi-service establishment'
    if (types.length === 1) return types[0] || ''
    if (types.length === 2) return types.join(' & ')
    return `${types.slice(0, 2).join(' & ')} & more`
  }

  const formatCompanyName = (name: string): string => {
    if (!name || name.trim().length === 0) return 'Company Name Not Set'
    return name.trim()
  }

  const formatContactPerson = (name: string, title?: string): string => {
    if (!name || name.trim().length === 0) return 'Contact not specified'
    if (title && title.trim().length > 0) {
      return `${name.trim()}, ${title.trim()}`
    }
    return name.trim()
  }

  const formatBioShort = (bio: string, maxLength: number = 120): string => {
    if (!bio || bio.trim().length === 0) return 'No description available'
    if (bio.length <= maxLength) return bio
    return bio.substring(0, maxLength - 3).trim() + '...'
  }

  const formatWebsite = (url: string): string => {
    if (!url || url.trim().length === 0) return 'No website'
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const formatVerificationStatus = (verified: boolean): string => {
    if (verified) {
      return 'Verified Company'
    }
    return 'Pending Verification'
  }

  return {
    formatBusinessType,
    formatEmployeeCount,
    formatYearsEstablished,
    formatAnnualRevenue,
    formatCoversPerService,
    formatSpecialties,
    formatCuisineTypes,
    formatEstablishmentTypes,
    formatCompanyName,
    formatContactPerson,
    formatBioShort,
    formatWebsite,
    formatVerificationStatus,
  }
}

export function useEmployerValidation() {
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

  const validateWebsite = (
    website: string
  ): { isValid: boolean; error?: string } => {
    if (!website || website.trim().length === 0) {
      return { isValid: true }
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

  const validateSpecialties = (
    specialties: string[]
  ): { isValid: boolean; error?: string } => {
    if (!specialties || !Array.isArray(specialties)) {
      return { isValid: true }
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

  const validateEmployerData = (
    data: Record<string, any>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    const requiredValidations = [
      validateCompanyName(data.company_name || ''),
      validateEmail(data.email || ''),
    ]

    requiredValidations.forEach((result) => {
      if (!result.isValid && result.error) {
        errors.push(result.error)
      }
    })

    const optionalValidations: Array<{
      field: unknown
      validator: (v: any) => { isValid: boolean; error?: string }
    }> = [
      { field: data.business_type, validator: validateBusinessType },
      { field: data.website, validator: validateWebsite },
    ]

    optionalValidations.forEach(({ field, validator }) => {
      if (field !== undefined) {
        const result = validator(field)
        if (!result.isValid && result.error) {
          errors.push(result.error)
        }
      }
    })

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

export function useEmployerFormattingAndValidation() {
  const formatting = useEmployerFormatting()
  const validation = useEmployerValidation()

  const formatDisplayName = (value: string) =>
    (value || '').trim().replace(/\s+/g, ' ').slice(0, 100)

  const validateDisplayName = (value: string) => {
    const normalized = formatDisplayName(value)
    if (!normalized) return 'Display name is required'
    if (normalized.length < 2) return 'Display name is too short'
    return true
  }

  return {
    ...formatting,
    ...validation,
    formatDisplayName,
    validateDisplayName,
  }
}