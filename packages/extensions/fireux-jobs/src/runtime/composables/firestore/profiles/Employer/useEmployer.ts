// packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Employer/useEmployer.ts
import { computed } from 'vue'
import { employerConfig } from '../../../../models/profiles/Employer.model'
import { useEmployerUpdate } from './useEmployerUpdate'
import { useEmployerFormattingAndValidation } from './useEmployerFormattingAndValidation'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile.ts'

/**
 * Facade: compose generic profile primitives + employer-specific helpers
 * Public API for editors: useEmployer()
 */
export function useEmployer() {
  // Generic primitives (state, computed flags, ensure/delete, collections)
  const base = useProfile(employerConfig)

  // Simple read-side computed from flattened profile
  const avatar = computed(() => (base.profile.value as any)?.avatar || '')
  const displayName = computed(
    () => (base.profile.value as any)?.display_name || ''
  )

  // Entity-specific helpers
  const { updateDisplayName, updateAvatar } = useEmployerUpdate()
  const { formatDisplayName, validateDisplayName } =
    useEmployerFormattingAndValidation()

  return {
    // generic backbone
    ...base,
    // read-side basics
    avatar,
    displayName,
    // write-side basics
    updateDisplayName,
    updateAvatar,
    // validation/formatting
    formatDisplayName,
    validateDisplayName,
  }
}
