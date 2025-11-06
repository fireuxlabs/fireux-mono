import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

/**
 * Stub ensure handler reserved for future hooks.
 */
export function useProfileEnsure(_config: ProfileConfig) {
  const ensure = async () =>
    ({ createdCore: false, createdApp: false } as const)
  return { ensure }
}
