import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

/**
 * Stub ensure handler reserved for future hooks. Accepts an optional patch so
 * call sites remain compatible once the implementation is filled in.
 */
export function useProfileEnsure(_config: ProfileConfig) {
  const ensure = async (_patch: Record<string, unknown> = {}) =>
    ({ createdCore: false, createdApp: false } as const)
  return { ensure }
}
