export function useEmployerFormatting() {
  // Format business type for display
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

  // Format employee count for display
  const formatEmployeeCount = (count: number): string => {
    if (count === 1) return '1 employee'
    if (count < 50) return `${count} employees`
    if (count < 100) return `${count} employees`
    if (count < 500) return `${count} employees`
    if (count < 1000) return `${count} employees`
    return `${Math.round(count / 100) * 100}+ employees`
  }

  // Format years established for display
  const formatYearsEstablished = (years: number): string => {
    if (years === 1) return '1 year in business'
    if (years < 5) return `${years} years in business`
    if (years < 10) return `${years} years established`
    if (years < 25) return `${years} years established`
    if (years < 50) return `${years}+ years established`
    return `${years}+ years of heritage`
  }

  // Format annual revenue for display
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

  // Format covers per service for display
  const formatCoversPerService = (covers: number): string => {
    if (covers < 50) return `${covers} covers per service`
    if (covers < 100) return `${covers} covers per service`
    if (covers < 200) return `${covers} covers per service`
    if (covers < 500) return `${covers} covers per service`
    return `${covers}+ covers per service`
  }

  // Format specialties list for display
  const formatSpecialties = (specialties: string[]): string => {
    if (!specialties || specialties.length === 0) return 'No specialties listed'
    if (specialties.length === 1) return specialties[0]
    if (specialties.length === 2) return specialties.join(' & ')
    if (specialties.length <= 4) return specialties.join(', ')
    return `${specialties.slice(0, 3).join(', ')} & ${specialties.length - 3} more`
  }

  // Format cuisine types for display
  const formatCuisineTypes = (cuisines: string[]): string => {
    if (!cuisines || cuisines.length === 0) return 'All cuisines'
    if (cuisines.length === 1) return cuisines[0]
    if (cuisines.length === 2) return cuisines.join(' & ')
    if (cuisines.length <= 3) return cuisines.join(', ')
    return `${cuisines.slice(0, 2).join(', ')} & ${cuisines.length - 2} more`
  }

  // Format establishment types for display
  const formatEstablishmentTypes = (types: string[]): string => {
    if (!types || types.length === 0) return 'Multi-service establishment'
    if (types.length === 1) return types[0]
    if (types.length === 2) return types.join(' & ')
    return `${types.slice(0, 2).join(' & ')} & more`
  }

  // Format company name for display (with fallbacks)
  const formatCompanyName = (name: string): string => {
    if (!name || name.trim().length === 0) return 'Company Name Not Set'
    return name.trim()
  }

  // Format contact person name for display
  const formatContactPerson = (name: string, title?: string): string => {
    if (!name || name.trim().length === 0) return 'Contact not specified'
    if (title && title.trim().length > 0) {
      return `${name.trim()}, ${title.trim()}`
    }
    return name.trim()
  }

  // Format business description with length limits
  const formatBioShort = (bio: string, maxLength: number = 120): string => {
    if (!bio || bio.trim().length === 0) return 'No description available'
    if (bio.length <= maxLength) return bio
    return bio.substring(0, maxLength - 3).trim() + '...'
  }

  // Format website URL for display
  const formatWebsite = (url: string): string => {
    if (!url || url.trim().length === 0) return 'No website'
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // Format verification status
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
