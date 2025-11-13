import { ref, type Ref } from 'vue'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { professionalConfig } from '../../../../../models/profiles/Professional.model.ts'

type CreateProfessionalHandler = ((
  patch?: Record<string, unknown>
) => Promise<unknown>) & {
  readonly state: Ref<boolean>
}

/**
 * Create a Professional profile while exposing a reactive busy state.
 */
export function useProfessionalCreate() {
  const { ensure } = useProfileEnsure(professionalConfig)
  const creating = ref(false)

  const createProfessional = (async (patch: Record<string, unknown> = {}) => {
    if (creating.value) return undefined
    creating.value = true
    try {
      return await ensure({ domain: 'professional', ...patch })
    } finally {
      creating.value = false
    }
  }) as CreateProfessionalHandler

  Object.defineProperty(createProfessional, 'state', {
    get: () => creating,
    enumerable: true,
  })

  return { createProfessional }
}
