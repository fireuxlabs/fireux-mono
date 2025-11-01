# Chef Composables Snapshot

Snapshot of all Chef-specific composables under `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/` as of the latest workspace state.

## useChefCreate.ts

```ts
// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts
import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profiles/useProfile.ts'
import { chefConfig } from '../../../../models/profiles/Chef.model'
import type { ChefCoreProfile } from '../../../../models/profiles/Chef.model'

/**
 * Chef-specific creation wrapper.
 * Forwards to useProfileCreate but gives us a hook
 * for Chef-only behavior later.
 */
export function useChefCreate() {
  const { ensure } = useProfile(chefConfig) as any

  async function createChef(profile?: Partial<ChefCoreProfile>) {
    // Pass through profile payload; mapping can be added later if needed
    return ensure(profile ?? {})
  }

  return { createChef }
}
```

## useChefFilters.ts

```ts
import { ref, computed, type Ref } from 'vue'
import type { ChefCoreProfile as Chef } from '../../../../models/profiles/Chef.model'

// Chef-specific filtering composable
export function useChefFilters(profiles: Ref<Chef[]>) {
  const filters = ref({
    search: '',
  })

  const filteredProfiles = computed(() => {
    if (!profiles.value) return []

    return profiles.value.filter((chef: Chef) => {
      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        const chefName = chef.display_name?.toLowerCase() || ''
        const specialties = chef.specialties?.join(' ').toLowerCase() || ''

        if (
          !chefName.includes(searchTerm) &&
          !specialties.includes(searchTerm)
        ) {
          return false
        }
      }

      return true
    })
  })

  const applyFilter = (filterType: string, value: any) => {
    if (filterType in filters.value) {
      ;(filters.value as any)[filterType] = value
    }
  }

  return {
    filteredProfiles,
    filters,
    applyFilter,
  }
}
```

## useChefFormattingAndValidation.ts

```ts
export * from './utils/useChefValidation'
```

## utils/useChefValidation.ts

```ts
import type { ChefCoreProfile as Chef } from '../../../../../models/profiles/Chef.model'

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

    // Helper to push error messages from validation results
    const addErrorIfInvalid = (res: { isValid: boolean; error?: string }) => {
      if (!res.isValid && res.error) errors.push(res.error)
    }

    // Required fields validation (ChefCoreProfile uses ProfileBase with id set from auth elsewhere)

    // Optional field validations
    if (chefData.display_name) {
      addErrorIfInvalid(validateChefName(chefData.display_name))
    }

    if (chefData.specialties) {
      addErrorIfInvalid(validateSpecialties(chefData.specialties))
    }

    // Note: experience/certifications aren't part of the current Chef model
    // If added later, re-enable and adjust validation accordingly

    // Support both snake_case (canonical) and camelCase inputs
    const bios = [
      {
        val: (chefData as any).bio_short ?? (chefData as any).bioShort,
        kind: 'short' as const,
      },
      {
        val: (chefData as any).bio_long ?? (chefData as any).bioLong,
        kind: 'long' as const,
      },
    ]
    for (const b of bios) {
      if (b.val) addErrorIfInvalid(validateBio(b.val, b.kind))
    }

    // Remove availability validation since it's not in the Chef model
    // if (chefData.availability) {
    //   const availabilityValidation = validateAvailability(chefData.availability)
    //   if (!availabilityValidation.isValid && availabilityValidation.error) {
    //     errors.push(availabilityValidation.error)
    //   }
    // }

    // Hourly rate is not part of current Chef model

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
```

## useChefUpdate.ts

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/chef/useChefUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
// Composables are auto-imported from core; avoid restricted subpath imports

/**
 * Environment-aware updater for a Chef profile.
 *
 * Behavior mirrors `useUserUpdate`:
 * - If `chefRef` provided → writes to that chef's doc (by `id`).
 * - Else → writes to the signed-in user's chef doc.
 *
 * Scopes:
 *   - Global  → chefs/{uid}
 *   - Tenant  → apps/{appId}/chefs/{uid}
 *
 * NOTE:
 * - This composable only WRITES finalized data (e.g. an avatar DOWNLOAD URL).
 * - Uploading is done elsewhere (e.g. your AvatarPicker / storage utilities).
 */
type WithId = { id: string }

type TargetScope = 'auto' | 'core' | 'app'

export function useChefUpdate(chefRef?: Ref<WithId | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const resolveTarget = (scope: TargetScope = 'auto') => {
    const id = chefRef?.value?.id ?? authRef.value?.uid
    if (!id) throw new Error('Not signed in and no chefRef.id provided')
    if (scope === 'app' || (scope === 'auto' && isTenant)) {
      if (!appId) throw new Error('Missing appId for tenant-scoped chef update')
      return { collection: `apps/${appId}/chefs`, id }
    }
    return { collection: 'chefs', id }
  }

  /** Generic partial update for arbitrary chef fields */
  const updateFields = async (
    partial: Record<string, unknown>,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = resolveTarget(scope)
    await updateDocument(collection, id, partial)
  }

  /** Update display name */
  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => {
    await updateFields({ display_name }, scope)
  }

  /** Avatar: build `${collection}/${id}/avatar` and upload via useImageStorage */
  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = resolveTarget(scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFields({ avatar: url }, scope)
    return url
  }

  return { updateFields, updateDisplayName, updateAvatar }
}
```
