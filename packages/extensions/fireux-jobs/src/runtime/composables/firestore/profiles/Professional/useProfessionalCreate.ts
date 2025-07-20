import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'

export function useProfessionalCreate() {
  const currentUser = useCurrentUser()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  const createProfessional = async (professionalData: any): Promise<string> => {
    if (!currentUser.value?.uid) {
      throw new Error(
        'User must be authenticated to create professional profile'
      )
    }

    creating.value = true
    error.value = null

    try {
      // Validate required fields
      if (!professionalData.name || professionalData.name.trim().length === 0) {
        throw new Error('Professional name is required')
      }

      // Prepare professional document with defaults
      const professionalDoc = {
        // Basic info
        name: professionalData.name?.trim() || '',
        title: professionalData.title?.trim() || '',
        bio: professionalData.bio?.trim() || '',
        email: professionalData.email?.trim() || currentUser.value.email || '',
        phone: professionalData.phone?.trim() || '',

        // Locations array
        locations: professionalData.locations || [],

        // Languages array
        languages: professionalData.languages || [],

        // Kitchen experience array
        kitchen_experience: professionalData.kitchen_experience || [],

        // Education array
        education: professionalData.education || [],

        // Certifications array
        certifications: professionalData.certifications || [],

        // Projects array
        projects: professionalData.projects || [],

        // Skills arrays
        cuisine_specialties: professionalData.cuisine_specialties || [],
        technical_skills: professionalData.technical_skills || [],
        soft_skills: professionalData.soft_skills || [],

        // Preferences
        preferred_work_schedule: professionalData.preferred_work_schedule || [],
        preferred_environment: professionalData.preferred_environment || '',
        salary_expectation: professionalData.salary_expectation || null,

        // Availability
        available_immediately: professionalData.available_immediately || false,
        available_from: professionalData.available_from || null,

        // Portfolio
        portfolio_url: professionalData.portfolio_url?.trim() || '',
        social_media: professionalData.social_media || {},

        // Profile management
        profile_visibility: professionalData.profile_visibility || 'public',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: currentUser.value.uid,
        status: 'active',
      }

      console.log(
        'Professional create standardized - needs setDocument implementation',
        professionalDoc
      )

      return currentUser.value.uid
    } catch (err: any) {
      error.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to create professional profile')
      throw error.value
    } finally {
      creating.value = false
    }
  }

  return {
    createProfessional,
    creating,
    error,
  }
}
