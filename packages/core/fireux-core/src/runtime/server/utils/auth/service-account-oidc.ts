import { OAuth2Client } from 'google-auth-library'

const GOOGLE_ISSUERS = new Set([
  'accounts.google.com',
  'https://accounts.google.com',
])
const SERVICE_ACCOUNT_EMAIL = /^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/i

export type ServiceAccountOidcPrincipal = {
  oidc_subject: string
  service_account_email: string
}

export class ServiceAccountOidcError extends Error {
  readonly code = 'invalid_service_account_identity'
}

/** Verifies signature, expiry, fixed audience, issuer, subject, and email. */
export async function verifyServiceAccountOidc(
  idToken: string,
  audience: string,
  client = new OAuth2Client()
): Promise<ServiceAccountOidcPrincipal> {
  const fixedAudience = audience.trim()
  if (!fixedAudience) {
    throw new ServiceAccountOidcError(
      'Service account authentication is unavailable.'
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
    const email = String(payload?.email || '')
      .trim()
      .toLowerCase()

    if (
      !payload ||
      !GOOGLE_ISSUERS.has(String(payload.iss || '')) ||
      !subject ||
      payload.email_verified !== true ||
      !SERVICE_ACCOUNT_EMAIL.test(email)
    ) {
      throw new ServiceAccountOidcError(
        'Service account authentication failed.'
      )
    }

    return {
      oidc_subject: subject,
      service_account_email: email,
    }
  } catch (error) {
    if (error instanceof ServiceAccountOidcError) throw error
    throw new ServiceAccountOidcError('Service account authentication failed.')
  }
}
