// FILE: packages/core/fireux-core/src/runtime/composables/state/useProfileState.ts
import { useState } from 'nuxt/app'

/**
 * Namespaced per-profile-type state slot.
 * Example: useProfileState<UserProfile>('user') => key: "profile:user"
 */
export function useProfileState<T>(profileType: string) {
  return {
    profile: useState<T | null>(`profile:${profileType}`, () => null),
  }
}
