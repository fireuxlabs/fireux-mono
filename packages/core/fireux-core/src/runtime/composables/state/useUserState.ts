// FILE: packages/core/fireux-core/src/runtime/composables/state/useUserState.ts
import { useState } from 'nuxt/app'
import type { User } from '../../models/core/user.model'

export type UserState = User | null

export function useUserState() {
  return { user: useState<UserState>('user', () => null) }
}
