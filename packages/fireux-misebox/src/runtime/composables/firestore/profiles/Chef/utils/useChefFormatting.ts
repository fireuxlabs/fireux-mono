import type { Chef } from '../../../../../models/profiles/Chef.model'

export function useChefFormatting() {
  /**
   * Format chef name for display
   */
  function formatChefName(chef: Chef): string {
    return chef.chef_name || 'Chef'
  }

  /**
   * Format chef title with name
   */
  function formatChefTitle(chef: Chef): string {
    const name = formatChefName(chef)
    return chef.title ? `${chef.title} ${name}` : name
  }

  /**
   * Format chef experience years
   */
  function formatExperienceYears(chef: Chef): string {
    if (!chef.kitchen_experience?.length) return '0 years'

    const totalYears = chef.kitchen_experience.reduce((total, exp) => {
      const startYear = parseInt(exp.from_year)
      const endYear = exp.ongoing
        ? new Date().getFullYear()
        : parseInt(exp.to_year || exp.from_year)
      return total + (endYear - startYear)
    }, 0)

    return totalYears === 1 ? '1 year' : `${totalYears} years`
  }

  /**
   * Format chef specialties as a readable string
   */
  function formatSpecialties(chef: Chef): string {
    if (!chef.specialties?.length) return 'No specialties listed'
    if (chef.specialties.length === 1) return chef.specialties[0]
    if (chef.specialties.length === 2) return chef.specialties.join(' and ')

    const lastSpecialty = chef.specialties.pop()
    return `${chef.specialties.join(', ')}, and ${lastSpecialty}`
  }

  /**
   * Format employment status for display
   */
  function formatEmploymentStatus(chef: Chef): string {
    switch (chef.employment_status) {
      case 'available':
        return 'Available for hire'
      case 'employed':
        return 'Currently employed'
      case 'freelance':
        return 'Freelance chef'
      case 'not_available':
        return 'Not available'
      default:
        return 'Status unknown'
    }
  }

  /**
   * Format hourly rate range
   */
  function formatHourlyRate(chef: Chef): string {
    if (!chef.hourly_rate_min && !chef.hourly_rate_max)
      return 'Rate not specified'

    const currency = chef.currency || 'USD'
    const symbol = currency === 'USD' ? '$' : `${currency} `

    if (chef.hourly_rate_min && chef.hourly_rate_max) {
      return `${symbol}${chef.hourly_rate_min} - ${symbol}${chef.hourly_rate_max}/hour`
    } else if (chef.hourly_rate_min) {
      return `From ${symbol}${chef.hourly_rate_min}/hour`
    } else {
      return `Up to ${symbol}${chef.hourly_rate_max}/hour`
    }
  }

  /**
   * Format chef bio with fallback
   */
  function formatBio(chef: Chef): string {
    return chef.bio_short || chef.bio_long || 'No bio available'
  }

  /**
   * Format dietary accommodations
   */
  function formatDietaryAccommodations(chef: Chef): string {
    if (!chef.dietary_accommodations?.length) return 'Standard dietary options'
    return chef.dietary_accommodations.join(', ')
  }

  /**
   * Format availability status
   */
  function formatAvailabilityStatus(chef: Chef): string {
    if (!chef.availability) return 'Availability not specified'

    const availableDays = Object.entries(chef.availability)
      .filter(([_, day]) => day?.available)
      .map(([dayName]) => dayName.charAt(0).toUpperCase() + dayName.slice(1))

    if (availableDays.length === 0) return 'Not available'
    if (availableDays.length === 7) return 'Available all week'
    if (availableDays.length >= 5) return 'Available most days'

    return `Available ${availableDays.join(', ')}`
  }

  /**
   * Format certification count
   */
  function formatCertificationCount(chef: Chef): string {
    const count = chef.certifications?.length || 0
    return count === 1 ? '1 certification' : `${count} certifications`
  }

  /**
   * Format education count
   */
  function formatEducationCount(chef: Chef): string {
    const count = chef.education?.length || 0
    return count === 1 ? '1 education' : `${count} educational qualifications`
  }

  /**
   * Format languages spoken
   */
  function formatLanguages(chef: Chef): string {
    if (!chef.languages?.length) return 'Languages not specified'

    return chef.languages
      .map((lang) => `${lang.language} (${lang.proficiency})`)
      .join(', ')
  }

  /**
   * Format travel willingness
   */
  function formatTravelWillingness(chef: Chef): string {
    if (!chef.willing_to_travel) return 'Local work only'

    const radius = chef.travel_radius_km
    return radius ? `Willing to travel within ${radius}km` : 'Willing to travel'
  }

  return {
    formatChefName,
    formatChefTitle,
    formatExperienceYears,
    formatSpecialties,
    formatEmploymentStatus,
    formatHourlyRate,
    formatBio,
    formatDietaryAccommodations,
    formatAvailabilityStatus,
    formatCertificationCount,
    formatEducationCount,
    formatLanguages,
    formatTravelWillingness,
  }
}
