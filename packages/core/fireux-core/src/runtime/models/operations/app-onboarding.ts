import type { AppRole } from '../core/app.model'

export type AppOnboardingPlacement = 'tenant' | 'standalone' | 'ecosystem'

export type AppOnboardingPlacementOption = {
  id: AppOnboardingPlacement
  app_role: AppRole
  target_ecosystem_id?: string
}

export type AppOnboardingPolicy = {
  host_app_id: string
  host_app_name: string
  options: AppOnboardingPlacementOption[]
  locked_placement?: AppOnboardingPlacement
  unavailable_reason?: string
}

/**
 * Browser-owned draft input. Infrastructure and storage placement are derived
 * by policy and must never be accepted from this object.
 */
export type AppOnboardingDraft = {
  name: string
  slug: string
  description: string
  placement: AppOnboardingPlacement | ''
}
