import type { UserIdentitySummary } from '../../user/models/user-directory.model.ts'
import type { App } from './app.model.ts'
import type {
  AppUserOnboardingStatus,
  AppUserRole,
  AppUserSubscription,
} from './app-user.model.ts'

export type AppAdminMember = {
  id: string
  role: AppUserRole
  subscription: AppUserSubscription
  user: UserIdentitySummary | null
}

export type AppAdminJoinRequest = {
  id: string
  user: UserIdentitySummary | null
}

export type AppAdminPeopleResponse = {
  ok: true
  appId: string
  members: AppAdminMember[]
  joinRequests: AppAdminJoinRequest[]
  truncated: boolean
}

export type CurrentAppMembership = {
  id: string
  role: AppUserRole
  subscription: AppUserSubscription
  onboarding_status: AppUserOnboardingStatus
  profiles: string[]
  kitchens: string[]
  primary_kitchen: string
  projects: string[]
  primary_project: string
  properties: string[]
  primary_property: string
  portfolios: string[]
  primary_portfolio: string
  suppliers: string[]
  primary_supplier: string
  blanks: string[]
  primary_blank: string
}

export type CurrentAppContextResponse = {
  ok: true
  appId: string
  app: App | null
  membership: CurrentAppMembership | null
}
