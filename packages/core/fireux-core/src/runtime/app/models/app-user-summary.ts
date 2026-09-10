import type { UserIdentitySummary } from '../../user/models/user-directory.model.ts'
import type { AppUserRole, AppUserSubscription } from './app-user.model.ts'

/** One AppUser enriched with the bounded User identity used for presentation. */
export type AppUserSummary = {
  id: string
  role: AppUserRole
  subscription: AppUserSubscription
  user: UserIdentitySummary | null
}

export type AppUserJoinRequestSummary = {
  id: string
  user: UserIdentitySummary | null
}

