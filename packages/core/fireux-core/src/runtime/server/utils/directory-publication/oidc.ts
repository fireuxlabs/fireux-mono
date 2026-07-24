// Concurrent edit — 2026-07-19 17:47 CEST — Directory Publication Scaffold: verify fixed-audience Google publisher identity.

import type { DirectoryPublisherPrincipalV1 } from '../../../models/core/supporting/directory-publication'
import {
  ServiceAccountOidcError,
  verifyServiceAccountOidc,
} from '../auth/service-account-oidc'

export class DirectoryPublisherOidcError extends Error {
  readonly code = 'invalid_directory_publisher_identity'
}

/** Verifies signature, expiry, fixed audience, issuer, subject, and email. */
export async function verifyDirectoryPublisherOidc(
  idToken: string,
  audience: string
): Promise<DirectoryPublisherPrincipalV1> {
  try {
    return await verifyServiceAccountOidc(idToken, audience)
  } catch (error) {
    if (error instanceof ServiceAccountOidcError) {
      throw new DirectoryPublisherOidcError(
        'Directory publisher authentication failed.'
      )
    }
    throw new DirectoryPublisherOidcError(
      'Directory publisher authentication failed.'
    )
  }
}
