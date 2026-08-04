// Concurrent edit — 2026-07-20 12:59 CEST — Account consent slice: expose authenticated idempotent UserPrivate provisioning.
// Concurrent edit — 2026-07-20 14:03 CEST — Account email integrity: sync later email changes only from a verified Firebase token claim.

import { createError, defineEventHandler, readBody } from 'h3'
import {
  FIREUX_ACCOUNT_TERMS_VERSION,
  type UserAccountProvisioningInput,
} from '../../../../models/operations/user-account-provisioning'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { provisionUserPrivateAccount } from '../../../utils/user-account/provision'

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
  return provisionUserPrivateAccount({
    uid,
    email,
    emailVerified: decoded.email_verified === true,
    termsVersion: readTermsVersion(body),
  })
})
