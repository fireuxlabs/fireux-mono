// Concurrent edit — 2026-07-19 22:10 CEST — Directory Publication Rules Pass: isolate canonical data, owner outboxes, and platform projections.

import type {
  AppDirectoryEntry,
  EcosystemDirectoryEntry,
} from './directory'

export const DirectoryPublicationStorage = {
  appProjections: 'directory-app-projections',
  ecosystemProjections: 'directory-ecosystem-projections',
  receipts: 'directory-publication-receipts',
  curation: 'directory-curation',
  sources: 'directory-sources',
} as const

export const DirectoryPublicationOwnerStorage = {
  outbox: 'directory-publication-outbox',
} as const

/** Dedicated server-only databases; neither stores canonical entity records. */
export const DirectoryPublicationDatabases = {
  ownerOutbox: 'directory-outbox',
  platform: 'platform-directory',
} as const

export type DirectoryEntityKind = 'app' | 'ecosystem'
export type DirectoryPublicationAction = 'upsert' | 'retire'
export type DirectoryProjectionState = 'active' | 'retired'
export type DirectoryPublicationReceiptOutcome = 'applied' | 'ignored_stale'
export type DirectoryPublicationDecisionOutcome =
  | DirectoryPublicationReceiptOutcome
  | 'ignored_duplicate'
  | 'rejected'
export type DirectoryPublicationOutboxState =
  | 'pending'
  | 'delivered'
  | 'failed'

export type DirectoryPublicationSourceV1 = {
  /** Firebase infrastructure identity; never substitute an entity id. */
  firebase_project_id: string
  database_id: string
  /** Canonical FireUX entity relationships. */
  project_id: string
  ecosystem_id?: string
}

/**
 * The owner worker normalizes the Google CloudEvent time to UTC RFC3339 with
 * exactly nine fractional digits. Receivers compare the tuple
 * `[source_event_time, event_id]` lexicographically. `event_id` is the stable
 * CloudEvent id and must be reused unchanged for every retry.
 */
export type DirectoryPublicationRevisionV1 = {
  source_event_time: string
}

export type DirectoryPublicationOrderV1 = {
  event_id: string
  revision: DirectoryPublicationRevisionV1
}

export const DirectoryPublicationEventTimeV1 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{9}Z$/

/** Total ordering used by both projection writers and replay/repair workers. */
export function compareDirectoryPublicationOrderV1(
  left: DirectoryPublicationOrderV1,
  right: DirectoryPublicationOrderV1
): -1 | 0 | 1 {
  if (left.revision.source_event_time < right.revision.source_event_time) {
    return -1
  }
  if (left.revision.source_event_time > right.revision.source_event_time) {
    return 1
  }
  if (left.event_id < right.event_id) return -1
  if (left.event_id > right.event_id) return 1
  return 0
}

export type AppDirectoryPublicationPayloadV1 = Omit<
  AppDirectoryEntry,
  'id' | 'detail_url' | 'status'
> & { status: 'active' }

export type EcosystemDirectoryPublicationPayloadV1 = Omit<
  EcosystemDirectoryEntry,
  'id' | 'detail_url' | 'app_count' | 'status'
> & { status: 'active' }

type DirectoryPublicationBaseV1<Kind extends DirectoryEntityKind> = {
  version: 1
  event_id: string
  action: DirectoryPublicationAction
  entity: {
    kind: Kind
    id: string
  }
  source: DirectoryPublicationSourceV1
  revision: DirectoryPublicationRevisionV1
}

export type AppDirectoryPublicationV1 =
  | (DirectoryPublicationBaseV1<'app'> & {
      action: 'upsert'
      payload: AppDirectoryPublicationPayloadV1
    })
  | (DirectoryPublicationBaseV1<'app'> & {
      action: 'retire'
      payload?: never
    })

export type EcosystemDirectoryPublicationV1 =
  | (DirectoryPublicationBaseV1<'ecosystem'> & {
      action: 'upsert'
      payload: EcosystemDirectoryPublicationPayloadV1
    })
  | (DirectoryPublicationBaseV1<'ecosystem'> & {
      action: 'retire'
      payload?: never
    })

export type DirectoryPublicationV1 =
  | AppDirectoryPublicationV1
  | EcosystemDirectoryPublicationV1

export type DirectoryPublicationOutboxV1 = {
  version: 1
  event: DirectoryPublicationV1
  delivery: {
    state: DirectoryPublicationOutboxState
    attempts: number
    created_at: string
    updated_at: string
    delivered_at?: string
    last_error_code?: string
    retryable?: boolean
  }
}

type DirectoryProjectionBaseV1<Kind extends DirectoryEntityKind> = {
  version: 1
  entity_kind: Kind
  entity_id: string
  source: DirectoryPublicationSourceV1
  revision: DirectoryPublicationRevisionV1
  last_event_id: string
  applied_at: string
}

type ActiveDirectoryProjectionV1<
  Kind extends DirectoryEntityKind,
  Payload,
> = DirectoryProjectionBaseV1<Kind> & {
  state: 'active'
  payload: Payload
  published_at: string
  retired_at?: never
  retired_by_event_id?: never
}

type RetiredDirectoryProjectionV1<Kind extends DirectoryEntityKind> =
  DirectoryProjectionBaseV1<Kind> & {
    state: 'retired'
    payload?: never
    retired_at: string
    retired_by_event_id: string
  }

/** Only active projections are public. Retirement persists as a tombstone. */
export type AppDirectoryProjectionV1 =
  | ActiveDirectoryProjectionV1<'app', AppDirectoryPublicationPayloadV1>
  | RetiredDirectoryProjectionV1<'app'>

export type EcosystemDirectoryProjectionV1 =
  | ActiveDirectoryProjectionV1<
      'ecosystem',
      EcosystemDirectoryPublicationPayloadV1
    >
  | RetiredDirectoryProjectionV1<'ecosystem'>

export type DirectoryProjectionV1 =
  | AppDirectoryProjectionV1
  | EcosystemDirectoryProjectionV1

/** FireUX-owned metadata is stored separately and is never owner-published. */
export type DirectoryCurationV1 = {
  version: 1
  entity_kind: DirectoryEntityKind
  entity_id: string
  launch_order: number
}

export type DirectoryPublicationReceiptV1 = {
  version: 1
  event_id: string
  entity_kind: DirectoryEntityKind
  entity_id: string
  source: DirectoryPublicationSourceV1
  revision: DirectoryPublicationRevisionV1
  outcome: DirectoryPublicationReceiptOutcome
  reason: string
  received_at: string
}

export type DirectorySourceAuthorizationV1 = {
  version: 1
  authorization_id: string
  /** Stable Google OIDC `sub`; email is retained for operator readability. */
  oidc_subject: string
  service_account_email: string
  firebase_project_id: string
  database_id: string
  project_id: string
  ecosystem_id?: string
  allowed_entity_kinds: DirectoryEntityKind[]
  allowed_app_ids: string[]
  allowed_ecosystem_ids: string[]
  enabled: boolean
  updated_at: string
}

export type DirectoryPublisherPrincipalV1 = {
  oidc_subject: string
  service_account_email: string
}

/**
 * Receiver rule:
 * - verify the Google signature, issuer, fixed audience, subject, email, and
 *   enabled source authorization before accepting an event;
 * - validate the v1 envelope, fixed event-time format, and stable non-empty
 *   event id before comparing revisions;
 * - require the event source and exact entity id/kind to match that record;
 * - require App payload `ecosystem_id` to match the authorized Ecosystem (or be
 *   empty for a direct Project App);
 * - in one transaction, treat an existing event receipt as a duplicate, then
 *   ignore revisions at or below the stored projection tuple;
 * - apply a newer upsert as active (including revival after retirement) and a
 *   newer retire as a payload-free tombstone; retirement must match the stored
 *   source exactly unless an operator has explicitly transferred authority.
 *
 * One service account may publish more than one canonical database scope.
 * Source authorization document ids therefore digest the Google OIDC subject
 * plus the exact source tuple. Receipt ids digest that authorization id plus
 * the event id; raw identities are stored only as data, never as path segments.
 */
