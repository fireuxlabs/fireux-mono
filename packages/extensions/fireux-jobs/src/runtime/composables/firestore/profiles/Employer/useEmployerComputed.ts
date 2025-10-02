import { computed } from 'vue'
import type { Employer } from '../../../../models/profiles/Employer.model'

/**
 * Read-only computed accessors for Employer profile values used by editors.
 */
export function useEmployerComputed(employer?: Employer | null) {
  const base = employer ?? ({} as Employer)

  const avatar = computed<string>(() => (base as any)?.avatar || '')
  const displayName = computed<string>(() => (base as any)?.display_name || '')

  return { avatar, displayName }
}
