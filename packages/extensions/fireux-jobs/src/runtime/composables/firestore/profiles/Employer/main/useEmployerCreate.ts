import { ref, type Ref } from 'vue'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { employerConfig } from '../../../../../models/profiles/Employer.model.ts'

type CreateEmployerHandler = ((
  patch?: Record<string, unknown>
) => Promise<unknown>) & {
  readonly state: Ref<boolean>
}

export function useEmployerCreate() {
  const { ensure } = useProfileEnsure(employerConfig)
  const creating = ref(false)

  const createEmployer = (async (patch: Record<string, unknown> = {}) => {
    if (creating.value) return undefined
    creating.value = true
    try {
      return await ensure({ domain: 'employer', ...patch })
    } finally {
      creating.value = false
    }
  }) as CreateEmployerHandler

  Object.defineProperty(createEmployer, 'state', {
    get: () => creating,
    enumerable: true,
  })

  return { createEmployer }
}
