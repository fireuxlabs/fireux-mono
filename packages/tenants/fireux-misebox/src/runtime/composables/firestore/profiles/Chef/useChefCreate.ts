// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts
import { ref } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import {
  chefConfig,
  type ChefInput,
} from '../../../../models/profiles/Chef.model'
import { useChefValidation } from './utils/useChefValidation'

export function useChefCreate() {
  const { validateChefData } = useChefValidation()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  const createChef = async (
    chefData: Partial<ChefInput>
  ): Promise<'success'> => {
    creating.value = true
    error.value = null
    try {
      const validation = validateChefData(chefData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const { createProfile } = useProfile(chefConfig)
      await createProfile(chefData) // createProfile adds id/avatar/timestamps
      return 'success'
    } catch (err: unknown) {
      const e =
        err instanceof Error ? err : new Error('Failed to create chef profile')
      error.value = e
      throw e
    } finally {
      creating.value = false
    }
  }

  return { createChef, creating, error }
}
