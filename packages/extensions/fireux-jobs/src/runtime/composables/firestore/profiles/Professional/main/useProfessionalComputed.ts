import { computed } from 'vue'
import type { ProfessionalProfile } from '../../../../models/profiles/Professional.model'

/**
 * Read-only computed accessors for Professional profile values used by editors.
 */
export function useProfessionalComputed(
  professional?: ProfessionalProfile | null
) {
  const base = professional ?? ({} as ProfessionalProfile)

  const avatar = computed<string>(() => (base as any)?.avatar || '')
  const displayName = computed<string>(() => (base as any)?.display_name || '')

  return { avatar, displayName }
}
