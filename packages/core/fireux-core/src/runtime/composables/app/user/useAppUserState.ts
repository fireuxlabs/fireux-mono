import { useState } from 'nuxt/app'
import type { AppUser } from '../../../models/core/appUser.model'

export function useAppUserState() {
  return {
    appUser: useState<AppUser | null>('appUser'),
  }
}
