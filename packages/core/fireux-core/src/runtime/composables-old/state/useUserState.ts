// packages/core/fireux-core/src/runtime/composables/state/useUserState.ts
import { useState } from 'nuxt/app'
import type { User } from '../../models/core/user.model'

export function useUserState() {
  return { user: useState<User | null>('user', () => null) }
}
