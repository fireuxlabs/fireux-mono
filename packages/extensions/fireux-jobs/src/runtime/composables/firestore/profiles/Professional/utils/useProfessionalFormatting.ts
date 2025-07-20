export function useProfessionalFormatting() {
  // Format professional name for display
  const formatProfessionalName = (name: string): string => {
    if (!name || name.trim().length === 0) return 'Professional Name Not Set'
    return name.trim()
  }

  // Format title/role for display
  const formatTitle = (title: string): string => {
    if (!title || title.trim().length === 0) return 'Title not specified'
    return title.trim()
  }

  // Format languages for display
  const formatLanguages = (languages: any[]): string => {
    if (!languages || languages.length === 0) return 'No languages specified'

    const formattedLangs = languages.map((lang) => {
      if (lang.proficiency && lang.proficiency !== 'Unknown') {
        return `${lang.language} (${lang.proficiency})`
      }
      return lang.language
    })

    if (formattedLangs.length === 1) return formattedLangs[0]
    if (formattedLangs.length === 2) return formattedLangs.join(' & ')
    if (formattedLangs.length <= 4) return formattedLangs.join(', ')
    return `${formattedLangs.slice(0, 3).join(', ')} & ${formattedLangs.length - 3} more`
  }

  // Format kitchen experience duration
  const formatExperienceDuration = (experience: any): string => {
    if (!experience.from_year) return 'Duration unknown'

    if (experience.ongoing) {
      return `${experience.from_month} ${experience.from_year} - Present`
    }

    if (experience.to_year && experience.to_month) {
      return `${experience.from_month} ${experience.from_year} - ${experience.to_month} ${experience.to_year}`
    }

    return `${experience.from_month} ${experience.from_year}`
  }

  // Format kitchen experience for display
  const formatKitchenExperience = (experience: any[]): string => {
    if (!experience || experience.length === 0)
      return 'No kitchen experience listed'

    const totalPositions = experience.length
    const currentPosition = experience.find((exp) => exp.ongoing)

    if (currentPosition) {
      return `${currentPosition.role} at ${currentPosition.name} (Current) + ${totalPositions - 1} previous`
    }

    const mostRecent = experience[0] // Assuming sorted by most recent
    if (mostRecent) {
      return `${mostRecent.role} at ${mostRecent.name} + ${totalPositions - 1} more`
    }

    return `${totalPositions} kitchen positions`
  }

  // Format education for display
  const formatEducation = (education: any[]): string => {
    if (!education || education.length === 0)
      return 'No formal education listed'

    if (education.length === 1) {
      const edu = education[0]
      return `${edu.degree} from ${edu.institution}`
    }

    return `${education.length} qualifications including ${education[0].degree}`
  }

  // Format certifications for display
  const formatCertifications = (certifications: any[]): string => {
    if (!certifications || certifications.length === 0)
      return 'No certifications listed'

    if (certifications.length === 1) return certifications[0].name
    if (certifications.length === 2)
      return `${certifications[0].name} & ${certifications[1].name}`
    return `${certifications[0].name} & ${certifications.length - 1} more certifications`
  }

  // Format projects for display
  const formatProjects = (projects: any[]): string => {
    if (!projects || projects.length === 0) return 'No projects listed'

    if (projects.length === 1) return projects[0].name
    return `${projects.length} projects including ${projects[0].name}`
  }

  // Format bio with length limits
  const formatBioShort = (bio: string, maxLength: number = 120): string => {
    if (!bio || bio.trim().length === 0) return 'No description available'
    if (bio.length <= maxLength) return bio
    return bio.substring(0, maxLength - 3).trim() + '...'
  }

  // Format years of experience calculation
  const calculateYearsOfExperience = (kitchenExperience: any[]): string => {
    if (!kitchenExperience || kitchenExperience.length === 0) return '0 years'

    let totalMonths = 0

    kitchenExperience.forEach((exp) => {
      if (exp.from_year) {
        const startYear = parseInt(exp.from_year)
        const startMonth = getMonthNumber(exp.from_month)

        let endYear: number
        let endMonth: number

        if (exp.ongoing) {
          const now = new Date()
          endYear = now.getFullYear()
          endMonth = now.getMonth() + 1
        } else if (exp.to_year && exp.to_month) {
          endYear = parseInt(exp.to_year)
          endMonth = getMonthNumber(exp.to_month)
        } else {
          return // Skip incomplete entries
        }

        const months = (endYear - startYear) * 12 + (endMonth - startMonth)
        totalMonths += Math.max(0, months)
      }
    })

    const years = Math.floor(totalMonths / 12)
    const remainingMonths = totalMonths % 12

    if (years === 0) {
      return remainingMonths === 1 ? '1 month' : `${remainingMonths} months`
    }

    if (remainingMonths === 0) {
      return years === 1 ? '1 year' : `${years} years`
    }

    return `${years} years, ${remainingMonths} months`
  }

  // Helper function to convert month name to number
  const getMonthNumber = (monthName: string): number => {
    const months = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    }
    return months[monthName as keyof typeof months] || 1
  }

  // Format location for display
  const formatLocations = (locations: any[]): string => {
    if (!locations || locations.length === 0) return 'Location not specified'

    const locationNames = locations.map((loc) => {
      if (loc.formatted_address) {
        // Extract city from formatted address
        const parts = loc.formatted_address.split(',')
        return parts[0]?.trim() || loc.formatted_address
      }
      return 'Location'
    })

    if (locationNames.length === 1) return locationNames[0]
    if (locationNames.length === 2) return locationNames.join(' & ')
    return `${locationNames[0]} & ${locationNames.length - 1} more locations`
  }

  return {
    formatProfessionalName,
    formatTitle,
    formatLanguages,
    formatExperienceDuration,
    formatKitchenExperience,
    formatEducation,
    formatCertifications,
    formatProjects,
    formatBioShort,
    calculateYearsOfExperience,
    formatLocations,
  }
}
