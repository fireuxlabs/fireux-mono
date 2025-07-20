import type { Professional } from '../../../../../models/profiles/Professional.model'

export function useProfessionalValidation() {
  // Validate professional name
  const validateProfessionalName = (
    name: string
  ): { isValid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Professional name is required' }
    }
    if (name.trim().length < 2) {
      return {
        isValid: false,
        error: 'Professional name must be at least 2 characters long',
      }
    }
    if (name.length > 100) {
      return {
        isValid: false,
        error: 'Professional name must be less than 100 characters',
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

  // Validate title/role
  const validateTitle = (
    title: string
  ): { isValid: boolean; error?: string } => {
    if (title && title.length > 100) {
      return {
        isValid: false,
        error: 'Title must be less than 100 characters',
      }
    }
    return { isValid: true }
  }

  // Validate languages
  const validateLanguages = (
    languages: any[]
  ): { isValid: boolean; error?: string } => {
    if (!languages || !Array.isArray(languages)) {
      return { isValid: true } // Languages are optional
    }

    if (languages.length > 10) {
      return {
        isValid: false,
        error: 'Maximum 10 languages allowed',
      }
    }

    for (const lang of languages) {
      if (
        !lang.language ||
        typeof lang.language !== 'string' ||
        lang.language.trim().length === 0
      ) {
        return {
          isValid: false,
          error: 'All language entries must have a valid language name',
        }
      }

      if (!lang.proficiency || typeof lang.proficiency !== 'string') {
        return {
          isValid: false,
          error: 'All language entries must have a proficiency level',
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
      return { isValid: true } // Experience is optional
    }

    if (experience.length > 20) {
      return {
        isValid: false,
        error: 'Maximum 20 experience entries allowed',
      }
    }

    for (const exp of experience) {
      if (
        !exp.name ||
        typeof exp.name !== 'string' ||
        exp.name.trim().length === 0
      ) {
        return {
          isValid: false,
          error: 'All experience entries must have a valid venue name',
        }
      }

      if (
        !exp.role ||
        typeof exp.role !== 'string' ||
        exp.role.trim().length === 0
      ) {
        return {
          isValid: false,
          error: 'All experience entries must have a valid role',
        }
      }

      if (!exp.from_year || !exp.from_month) {
        return {
          isValid: false,
          error: 'All experience entries must have start date',
        }
      }

      if (!exp.ongoing && (!exp.to_year || !exp.to_month)) {
        return {
          isValid: false,
          error: 'Non-ongoing experience entries must have end date',
        }
      }
    }

    return { isValid: true }
  }

  // Validate education
  const validateEducation = (
    education: any[]
  ): { isValid: boolean; error?: string } => {
    if (!education || !Array.isArray(education)) {
      return { isValid: true } // Education is optional
    }

    if (education.length > 10) {
      return {
        isValid: false,
        error: 'Maximum 10 education entries allowed',
      }
    }

    for (const edu of education) {
      if (
        !edu.institution ||
        typeof edu.institution !== 'string' ||
        edu.institution.trim().length === 0
      ) {
        return {
          isValid: false,
          error: 'All education entries must have a valid institution name',
        }
      }

      if (
        !edu.degree ||
        typeof edu.degree !== 'string' ||
        edu.degree.trim().length === 0
      ) {
        return {
          isValid: false,
          error: 'All education entries must have a valid degree/program',
        }
      }
    }

    return { isValid: true }
  }

  // Validate complete professional data
  const validateProfessionalData = (
    data: Partial<Professional>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate required fields
    const requiredValidations = [
      validateProfessionalName(data.professional_name || ''),
      validateEmail(data.email || ''),
    ]

    requiredValidations.forEach((result) => {
      if (!result.isValid && result.error) {
        errors.push(result.error)
      }
    })

    // Validate optional fields
    if (data.title) {
      const titleResult = validateTitle(data.title)
      if (!titleResult.isValid && titleResult.error) {
        errors.push(titleResult.error)
      }
    }

    if (data.languages) {
      const languagesResult = validateLanguages(data.languages)
      if (!languagesResult.isValid && languagesResult.error) {
        errors.push(languagesResult.error)
      }
    }

    if (data.kitchen_experience) {
      const experienceResult = validateKitchenExperience(
        data.kitchen_experience
      )
      if (!experienceResult.isValid && experienceResult.error) {
        errors.push(experienceResult.error)
      }
    }

    if (data.education) {
      const educationResult = validateEducation(data.education)
      if (!educationResult.isValid && educationResult.error) {
        errors.push(educationResult.error)
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  return {
    validateProfessionalName,
    validateEmail,
    validateTitle,
    validateLanguages,
    validateKitchenExperience,
    validateEducation,
    validateProfessionalData,
  }
}
