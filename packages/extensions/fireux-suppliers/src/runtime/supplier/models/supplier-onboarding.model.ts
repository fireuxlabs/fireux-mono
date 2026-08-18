// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: define the fixed-runtime completion contract.

export type SupplierOnboardingAction = 'create' | 'connect' | 'open'

export type SupplierOnboardingCompleteInput = {
  supplier_id?: string
  organization_name?: string
  company_id?: string
}

export type SupplierOnboardingCompleteResult = {
  ok: true
  supplier_id: string
  action: SupplierOnboardingAction
  created_root: boolean
  created_app_support: boolean
}
