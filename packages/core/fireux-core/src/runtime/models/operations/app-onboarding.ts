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
  primary_entity_options: AppOnboardingPrimaryEntityOption[]
  locked_placement?: AppOnboardingPlacement
  unavailable_reason?: string
}

export type AppOnboardingPrimaryEntityOption = {
  family: string
  label: string
  description: string
  root_onboarding_path: string
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
  primary_entity_family: string
  primary_entity_id: string
}
