// packages/core/fireux-core/src/runtime/composables/state/useProfileState.ts
import { useState } from 'nuxt/app'
export function useProfileState<T>(profileType: string) {
  return {
    profile: useState<T | null>(`profile:${profileType}`, () => null),
  }
}
