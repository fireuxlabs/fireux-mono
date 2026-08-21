import type { AppUserAccessTier } from '../utils/app-user-access'
import type { UserIdentitySummary } from '../../user/models/user-directory.model.ts'
import type { AppDetail } from './app-directory.model.ts'

export type AppAdminMember = {
  id: string
  role: 'admin' | 'user'
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
  role: 'admin' | 'user'
  is_premium: boolean
  access_tier: AppUserAccessTier
  has_premium_access: boolean
  workspace_enabled: boolean
  onboarding_status: 'pending' | 'completed' | 'skipped'
  profiles: string[]
}

export type CurrentApp = AppDetail & {
  self_join_enabled: boolean
}

export type CurrentAppContextResponse = {
  ok: true
  appId: string
  app: CurrentApp | null
  membership: CurrentAppMembership | null
}
