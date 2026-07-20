// Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: align provisioning evidence with the current legal version.

// This is the published Terms and Privacy version shown on both legal pages.
export const FIREUX_ACCOUNT_TERMS_VERSION = '2025-11-29' as const

export type UserAccountProvisioningInput = {
  terms_version?: typeof FIREUX_ACCOUNT_TERMS_VERSION
}

export type UserAccountProvisioningResult = {
  ok: true
  created: boolean
  terms_recorded: boolean
}
