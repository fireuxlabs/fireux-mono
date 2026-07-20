// Concurrent edit — 2026-07-19 17:47 CEST — Directory Publication Scaffold: verify fixed-audience Google publisher identity.

import { OAuth2Client } from 'google-auth-library'
import type { DirectoryPublisherPrincipalV1 } from '../../../models/core/supporting/directory-publication'

const GOOGLE_ISSUERS = new Set([
  'accounts.google.com',
  'https://accounts.google.com',
])
const SERVICE_ACCOUNT_EMAIL = /^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/i

export class DirectoryPublisherOidcError extends Error {
  readonly code = 'invalid_directory_publisher_identity'
}

/** Verifies signature, expiry, fixed audience, issuer, subject, and email. */
export async function verifyDirectoryPublisherOidc(
  idToken: string,
  audience: string,
  client = new OAuth2Client()
): Promise<DirectoryPublisherPrincipalV1> {
  const fixedAudience = audience.trim()
  if (!fixedAudience) {
    throw new DirectoryPublisherOidcError(
      'Directory publisher authentication is unavailable.'
    )
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: fixedAudience,
      maxExpiry: 3600,
    })
    const payload = ticket.getPayload()
    const subject = String(payload?.sub || '').trim()
    const email = String(payload?.email || '').trim().toLowerCase()

    if (
      !payload ||
      !GOOGLE_ISSUERS.has(String(payload.iss || '')) ||
      !subject ||
      payload.email_verified !== true ||
      !SERVICE_ACCOUNT_EMAIL.test(email)
    ) {
      throw new DirectoryPublisherOidcError(
        'Directory publisher authentication failed.'
      )
    }

    return {
      oidc_subject: subject,
      service_account_email: email,
    }
  } catch (error) {
    if (error instanceof DirectoryPublisherOidcError) throw error
    throw new DirectoryPublisherOidcError(
      'Directory publisher authentication failed.'
    )
  }
}
