import type { AppUser } from './models/model'
import type { UserIdentitySummary } from '../../user/models/user-directory.model.ts'
import type { AppUserRole, AppUserSubscription } from './models/model.ts'

/** One AppUser enriched with the bounded User identity used for presentation. */
export type AppUserSummary = {
  id: string
  role: AppUserRole
  subscription: AppUserSubscription
  user: UserIdentitySummary | null
}

/** AppUser paired with its path-owned document id. */
export type AppUserWithId = AppUser & { id: string }
