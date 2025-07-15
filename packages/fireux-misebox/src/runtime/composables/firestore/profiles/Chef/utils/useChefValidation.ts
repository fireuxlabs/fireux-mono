import type { Chef } from '../../../../../models/profiles/Chef.model'

export function useChefValidation() {
  // Validate chef name
  const validateChefName = (
    name: string
  ): { isValid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Chef name is required' }
    }
    if (name.trim().length < 2) {
      return {
        isValid: false,
        error: 'Chef name must be at least 2 characters long',
      }
    }
    if (name.length > 100) {
      return {
        isValid: false,
        error: 'Chef name must be less than 100 characters',
      }
    }
    return { isValid: true }
  }

  // Validate specialties
  const validateSpecialties = (
    specialties: string[]
  ): { isValid: boolean; error?: string } => {
    if (!specialties || !Array.isArray(specialties)) {
      return { isValid: true } // Optional field
    }
    if (specialties.length > 20) {
      return { isValid: false, error: 'Maximum 20 specialties allowed' }
    }
    for (const specialty of specialties) {
      if (typeof specialty !== 'string' || specialty.trim().length === 0) {
        return {
          isValid: false,
          error: 'All specialties must be non-empty strings',
        }
      }
      if (specialty.length > 50) {
        return {
          isValid: false,
          error: 'Each specialty must be less than 50 characters',
        }
      }
    }
    return { isValid: true }
  }

  // Validate kitchen experience
  const validateKitchenExperience = (
    experience: any[]
  ): { isValid: boolean; error?: string } => {
    if (!experience || !Array.isArray(experience)) {
      return { isValid: true } // Optional field
    }
    if (experience.length > 15) {
      return { isValid: false, error: 'Maximum 15 kitchen experiences allowed' }
    }
    for (const exp of experience) {
      if (!exp.kitchen_name || exp.kitchen_name.trim().length === 0) {
        return {
          isValid: false,
          error: 'Kitchen name is required for experience entries',
        }
      }
      if (!exp.role || exp.role.trim().length === 0) {
        return {
          isValid: false,
          error: 'Role is required for experience entries',
        }
      }
      if (!exp.from_year || !/^\d{4}$/.test(exp.from_year)) {
        return {
          isValid: false,
          error: 'Valid from year (YYYY) is required for experience entries',
        }
      }
    }
    return { isValid: true }
  }

  // Validate certifications
  const validateCertifications = (
    certifications: any[]
  ): { isValid: boolean; error?: string } => {
    if (!certifications || !Array.isArray(certifications)) {
      return { isValid: true } // Optional field
    }
    if (certifications.length > 20) {
      return { isValid: false, error: 'Maximum 20 certifications allowed' }
    }
    for (const cert of certifications) {
      if (!cert.name || cert.name.trim().length === 0) {
        return { isValid: false, error: 'Certification name is required' }
      }
      if (
        !cert.issuing_organization ||
        cert.issuing_organization.trim().length === 0
      ) {
        return {
          isValid: false,
          error: 'Issuing organization is required for certifications',
        }
      }
      if (!cert.year || !/^\d{4}$/.test(cert.year)) {
        return {
          isValid: false,
          error: 'Valid year (YYYY) is required for certifications',
        }
      }
    }
    return { isValid: true }
  }

  // Validate bio
  const validateBio = (
    bio: string,
    type: 'short' | 'long' = 'short'
  ): { isValid: boolean; error?: string } => {
    if (!bio) {
      return { isValid: true } // Optional field
    }
    const maxLength = type === 'short' ? 500 : 2000
    if (bio.length > maxLength) {
      return {
        isValid: false,
        error: `Bio must be less than ${maxLength} characters`,
      }
    }
    return { isValid: true }
  }

  // Validate availability schedule
  const validateAvailability = (
    availability: any
  ): { isValid: boolean; error?: string } => {
    if (!availability) {
      return { isValid: true } // Optional field
    }
    const validDays = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]
    const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/

    for (const day in availability) {
      if (!validDays.includes(day)) {
        return { isValid: false, error: `Invalid day: ${day}` }
      }
      const schedule = availability[day]
      if (schedule.available && (!schedule.start || !schedule.end)) {
        return {
          isValid: false,
          error: `Start and end times required when ${day} is available`,
        }
      }
      if (schedule.start && !timeRegex.test(schedule.start)) {
        return {
          isValid: false,
          error: `Invalid start time format for ${day} (use HH:MM)`,
        }
      }
      if (schedule.end && !timeRegex.test(schedule.end)) {
        return {
          isValid: false,
          error: `Invalid end time format for ${day} (use HH:MM)`,
        }
      }
    }
    return { isValid: true }
  }

  // Validate hourly rates
  const validateHourlyRates = (
    min?: number,
    max?: number
  ): { isValid: boolean; error?: string } => {
    if (min !== undefined && (min < 0 || min > 1000)) {
      return {
        isValid: false,
        error: 'Minimum hourly rate must be between 0 and 1000',
      }
    }
    if (max !== undefined && (max < 0 || max > 1000)) {
      return {
        isValid: false,
        error: 'Maximum hourly rate must be between 0 and 1000',
      }
    }
    if (min !== undefined && max !== undefined && min > max) {
      return {
        isValid: false,
        error: 'Minimum rate cannot be higher than maximum rate',
      }
    }
    return { isValid: true }
  }

  // Comprehensive chef data validation
  const validateChefData = (
    chefData: Partial<Chef>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Required fields validation
    if (!chefData.uid) {
      errors.push('User ID is required')
    }

    // Optional field validations
    if (chefData.chef_name) {
      const nameValidation = validateChefName(chefData.chef_name)
      if (!nameValidation.isValid && nameValidation.error) {
        errors.push(nameValidation.error)
      }
    }

    if (chefData.specialties) {
      const specialtiesValidation = validateSpecialties(chefData.specialties)
      if (!specialtiesValidation.isValid && specialtiesValidation.error) {
        errors.push(specialtiesValidation.error)
      }
    }

    if (chefData.chef_experience) {
      const experienceValidation = validateKitchenExperience(
        chefData.chef_experience
      )
      if (!experienceValidation.isValid && experienceValidation.error) {
        errors.push(experienceValidation.error)
      }
    }

    if (chefData.certifications) {
      const certificationsValidation = validateCertifications(
        chefData.certifications
      )
      if (!certificationsValidation.isValid && certificationsValidation.error) {
        errors.push(certificationsValidation.error)
      }
    }

    if (chefData.bio_short) {
      const bioValidation = validateBio(chefData.bio_short, 'short')
      if (!bioValidation.isValid && bioValidation.error) {
        errors.push(bioValidation.error)
      }
    }

    if (chefData.bio_long) {
      const bioValidation = validateBio(chefData.bio_long, 'long')
      if (!bioValidation.isValid && bioValidation.error) {
        errors.push(bioValidation.error)
      }
    }

    // Remove availability validation since it's not in the Chef model
    // if (chefData.availability) {
    //   const availabilityValidation = validateAvailability(chefData.availability)
    //   if (!availabilityValidation.isValid && availabilityValidation.error) {
    //     errors.push(availabilityValidation.error)
    //   }
    // }

    // Fix hourly rate validation - Chef model has hourly_rate, not min/max
    if (chefData.hourly_rate !== undefined) {
      if (chefData.hourly_rate < 0) {
        errors.push('Hourly rate cannot be negative')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  return {
    validateChefName,
    validateSpecialties,
    validateKitchenExperience,
    validateCertifications,
    validateBio,
    validateAvailability,
    validateHourlyRates,
    validateChefData,
  }
}
