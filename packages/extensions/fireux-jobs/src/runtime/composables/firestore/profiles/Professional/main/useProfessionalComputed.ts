import { computed } from 'vue'
import type { Professional } from '../../../../models/profiles/Professional.model'

/**
 * Read-only computed accessors for Professional profile values used by editors.
 */
export function useProfessionalComputed(professional?: Professional | null) {
  const base = professional ?? ({} as Professional)

  const avatar = computed<string>(() => (base as any)?.avatar || '')
  const displayName = computed<string>(() => (base as any)?.display_name || '')

  return { avatar, displayName }
}
