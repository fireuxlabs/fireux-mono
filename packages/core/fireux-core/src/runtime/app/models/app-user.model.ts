export type AppUserRole = 'user' | 'admin'
export type AppUserOnboardingStatus = 'pending' | 'completed' | 'skipped'

export type AppUser = {
  id: string
  role: AppUserRole
  is_premium: boolean
  onboarding_status: AppUserOnboardingStatus
}
