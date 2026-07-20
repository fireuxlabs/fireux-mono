// Concurrent edit — 2026-07-19 22:10 CEST — Directory Publication Rules Pass: require the dedicated platform database with no fallback.

import { DirectoryPublicationDatabases } from 'fireux-core/runtime/models/core/supporting/directory-publication'

export type DirectoryPublicationReceiverConfig = {
  enabled: boolean
  audience: string
  databaseId: string
}

/** Private environment only; the audience is never inferred from request Host. */
export function getDirectoryPublicationReceiverConfig(): DirectoryPublicationReceiverConfig {
  return {
    enabled:
      String(process.env.FIREUX_DIRECTORY_PUBLICATION_RECEIVER_ENABLED || '') ===
      'true',
    audience: String(
      process.env.FIREUX_DIRECTORY_PUBLICATION_OIDC_AUDIENCE || ''
    ).trim(),
    databaseId: String(
      process.env.FIREUX_DIRECTORY_PUBLICATION_DATABASE_ID || ''
    ).trim(),
  }
}

export function isDirectoryPublicationDatabase(databaseId: string) {
  return databaseId === DirectoryPublicationDatabases.platform
}
