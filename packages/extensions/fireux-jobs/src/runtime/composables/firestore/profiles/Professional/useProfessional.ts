import { computed } from 'vue'
import type { Professional } from '../../../../models/profiles/Professional.model'
import { useProfessionalUpdate } from './useProfessionalUpdate'

export function useProfessional(professional?: Professional | null) {
  const base = professional ?? ({} as Professional)

  // Basic display fields
  const avatar = computed<string>(() => (base as any)?.avatar || '')
  const displayName = computed<string>(() => (base as any)?.display_name || '')

  // Formatting + validation (keep minimal and local)
  const formatDisplayName = (v: string) =>
    v?.trim().replace(/\s+/g, ' ').slice(0, 100)
  const validateDisplayName = (v: string) => {
    const s = formatDisplayName(v)
    if (!s) return 'Display name is required'
    if (s.length < 2) return 'Display name is too short'
    return true
  }

  // Update delegates
  const { updateDisplayName, updateAvatar, setRelevantExperience, setOtherExperience } =
    useProfessionalUpdate()

  return {
    avatar,
    displayName,
    updateDisplayName,
    updateAvatar,
    setRelevantExperience,
    setOtherExperience,
    validateDisplayName,
    formatDisplayName,
  }
}
