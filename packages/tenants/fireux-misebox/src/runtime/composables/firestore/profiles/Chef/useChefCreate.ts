// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts
import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import { chefConfig, ChefMapper } from '../../../../models/profiles/Chef.model'
import type { ChefCoreProfile } from '../../../../models/profiles/Chef.model'

/**
 * Chef-specific creation wrapper.
 * Forwards to useProfileCreate but gives us a hook
 * for Chef-only behavior later.
 */
export function useChefCreate() {
  const { ensure } = useProfileCreate(chefConfig)

  async function createChef(profile?: Partial<ChefCoreProfile>) {
    const fsPayload = ChefMapper.toFs(profile ?? {}, { dropNullish: true })
    return ensure(fsPayload)
  }

  return { createChef }
}
