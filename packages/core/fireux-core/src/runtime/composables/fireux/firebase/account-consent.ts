import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../../models/core/supporting/user-account-provisioning'

const STORAGE_KEY = 'fireux_pending_account_consent'
const MAX_AGE_MS = 60 * 60 * 1000
let pendingVersion: string | null = null

export function rememberPendingAccountConsent(termsVersion: string) {
  if (termsVersion !== FIREUX_ACCOUNT_TERMS_VERSION) {
    throw new Error(
      'Accept the current Terms of Service and acknowledge the Privacy Policy.'
    )
  }
  pendingVersion = termsVersion
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ termsVersion, createdAt: Date.now() })
    )
  } catch {
    // Popup auth can still use the in-memory value when storage is unavailable.
  }
}

export function readPendingAccountConsent() {
  if (pendingVersion === FIREUX_ACCOUNT_TERMS_VERSION) return pendingVersion
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const createdAt = Number(parsed.createdAt)
    if (
      parsed.termsVersion !== FIREUX_ACCOUNT_TERMS_VERSION ||
      !Number.isFinite(createdAt) ||
      createdAt > Date.now() ||
      Date.now() - createdAt > MAX_AGE_MS
    ) {
      clearPendingAccountConsent()
      return null
    }
    pendingVersion = FIREUX_ACCOUNT_TERMS_VERSION
    return pendingVersion
  } catch {
    clearPendingAccountConsent()
    return null
  }
}

export function clearPendingAccountConsent() {
  pendingVersion = null
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {}
}
