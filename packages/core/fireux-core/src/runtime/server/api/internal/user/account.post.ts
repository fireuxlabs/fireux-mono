// Concurrent edit — 2026-07-20 12:59 CEST — Account consent slice: expose authenticated idempotent UserAccount provisioning.
// Concurrent edit — 2026-07-20 14:03 CEST — Account email integrity: sync later email changes only from a verified Firebase token claim.

import { createError, defineEventHandler, readBody } from 'h3'
import {
  FIREUX_ACCOUNT_TERMS_VERSION,
  type UserAccountProvisioningInput,
} from '../../../../user/models/user-account-provisioning'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { provisionUserAccount } from '../../../../user/server/user-account/provision'

function readTermsVersion(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return undefined
  const value = (body as Record<string, unknown>).terms_version
  if (value == null || value === '') return undefined
  if (value !== FIREUX_ACCOUNT_TERMS_VERSION) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The account terms version is not current.',
    })
  }
  return value
}

export default defineEventHandler(async (event) => {
  const { uid, decoded } = await requireFirebaseBearerUser(event)
  const email = typeof decoded.email === 'string' ? decoded.email.trim() : ''
  if (!email) {
    throw createError({
      statusCode: 403,
      statusMessage: 'An email identity is required.',
    })
  }

  const body = await readBody<UserAccountProvisioningInput>(event)
  try {
    return await provisionUserAccount({
      uid,
      email,
      emailVerified: decoded.email_verified === true,
      termsVersion: readTermsVersion(body),
    })
  } catch (error) {
    console.error('[User account provisioning] failed', { uid, error })
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? Number(error.statusCode)
        : 0
    if (statusCode >= 400 && statusCode < 500) throw error
    if (import.meta.dev && error instanceof Error && error.message.trim()) {
      throw createError({
        statusCode: 500,
        statusMessage: `Account record could not be created: ${error.message.trim()}`,
      })
    }
    throw error
  }
})
