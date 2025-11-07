import { ref, type Ref } from 'vue'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { chefConfig } from '../../../../../models/profiles/Chef.model.ts'

type CreateChefHandler = ((
  patch?: Record<string, unknown>
) => Promise<unknown>) & {
  readonly state: Ref<boolean>
}

export function useChefCreate() {
  const { ensure } = useProfileEnsure(chefConfig)
  const creating = ref(false)

  const createChef = (async (patch: Record<string, unknown> = {}) => {
    if (creating.value) return undefined
    creating.value = true
    try {
      return await ensure({ domain: 'chef', ...patch })
    } finally {
      creating.value = false
    }
  }) as CreateChefHandler

  Object.defineProperty(createChef, 'state', {
    get: () => creating,
    enumerable: true,
  })

  return { createChef }
}
