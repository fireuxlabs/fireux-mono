// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { chefConfig } from '../../../../models/profiles/Chef.model'
import type { ChefCoreProfile } from '../../../../models/profiles/Chef.model'

/**
 * Chef-specific creation wrapper.
 * Forwards to useProfileCreate but gives us a hook
 * for Chef-only behavior later.
 */
export function useChefCreate() {
  const { ensure } = useProfile(chefConfig) as any

  async function createChef(profile?: Partial<ChefCoreProfile>) {
    // Pass through profile payload; mapping can be added later if needed
    return ensure(profile ?? {})
  }

  return { createChef }
}
