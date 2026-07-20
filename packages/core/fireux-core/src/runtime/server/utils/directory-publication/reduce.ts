// Concurrent edit — 2026-07-19 22:10 CEST — Directory Publication Rules Pass: allow one OIDC principal to own multiple authorized source scopes.

import type {
  DirectoryProjectionV1,
  DirectoryPublicationDecisionOutcome,
  DirectoryPublicationReceiptV1,
  DirectoryPublicationSourceV1,
  DirectoryPublicationV1,
  DirectoryPublisherPrincipalV1,
  DirectorySourceAuthorizationV1,
} from '../../../models/core/supporting/directory-publication'
import { compareDirectoryPublicationOrderV1 } from '../../../models/core/supporting/directory-publication'

export type DirectoryPublicationReduction = {
  outcome: DirectoryPublicationDecisionOutcome
  reason: string
  receipt: DirectoryPublicationReceiptV1 | null
  projection: DirectoryProjectionV1 | null
}

export type ReduceDirectoryPublicationInput = {
  event: DirectoryPublicationV1
  authorization: DirectorySourceAuthorizationV1
  principal: DirectoryPublisherPrincipalV1
  currentProjection: DirectoryProjectionV1 | null
  receiptExists: boolean
  appliedAt: string
}

function sameSource(
  left: DirectoryPublicationSourceV1,
  right: DirectoryPublicationSourceV1
) {
  return (
    left.firebase_project_id === right.firebase_project_id &&
    left.database_id === right.database_id &&
    left.project_id === right.project_id &&
    (left.ecosystem_id || '') === (right.ecosystem_id || '')
  )
}

function rejectionReason(input: ReduceDirectoryPublicationInput) {
  const { authorization, event, principal } = input
  const kind = event.entity.kind
  const allowedIds =
    kind === 'app'
      ? authorization.allowed_app_ids
      : authorization.allowed_ecosystem_ids

  if (!authorization.enabled) return 'source_disabled'
  if (authorization.oidc_subject !== principal.oidc_subject) {
    return 'subject_mismatch'
  }
  if (
    authorization.service_account_email.toLowerCase() !==
    principal.service_account_email.toLowerCase()
  ) {
    return 'email_mismatch'
  }
  if (!sameSource(event.source, authorization)) return 'source_mismatch'
  if (!authorization.allowed_entity_kinds.includes(kind)) {
    return 'kind_not_allowed'
  }
  if (!allowedIds.includes(event.entity.id)) return 'entity_not_allowed'
  if (
    kind === 'ecosystem' &&
    event.source.ecosystem_id !== event.entity.id
  ) {
    return 'ecosystem_source_mismatch'
  }
  if (
    kind === 'app' &&
    event.action === 'upsert' &&
    (!('ecosystem_id' in event.payload) ||
      event.payload.ecosystem_id !== (event.source.ecosystem_id || ''))
  ) {
    return 'app_ecosystem_mismatch'
  }
  if (
    input.currentProjection &&
    !sameSource(input.currentProjection.source, event.source)
  ) {
    return 'projection_source_mismatch'
  }
  return ''
}

function receipt(
  input: ReduceDirectoryPublicationInput,
  outcome: DirectoryPublicationReceiptV1['outcome'],
  reason: string
): DirectoryPublicationReceiptV1 {
  return {
    version: 1,
    event_id: input.event.event_id,
    entity_kind: input.event.entity.kind,
    entity_id: input.event.entity.id,
    source: input.event.source,
    revision: input.event.revision,
    outcome,
    reason,
    received_at: input.appliedAt,
  }
}

export function reduceDirectoryPublication(
  input: ReduceDirectoryPublicationInput
): DirectoryPublicationReduction {
  const rejected = rejectionReason(input)
  if (rejected) {
    return {
      outcome: 'rejected',
      reason: rejected,
      receipt: null,
      projection: null,
    }
  }

  if (input.receiptExists) {
    return {
      outcome: 'ignored_duplicate',
      reason: 'receipt_exists',
      receipt: null,
      projection: null,
    }
  }

  if (
    input.currentProjection &&
    compareDirectoryPublicationOrderV1(
      {
        event_id: input.event.event_id,
        revision: input.event.revision,
      },
      {
        event_id: input.currentProjection.last_event_id,
        revision: input.currentProjection.revision,
      }
    ) <= 0
  ) {
    return {
      outcome: 'ignored_stale',
      reason: 'revision_not_newer',
      receipt: receipt(input, 'ignored_stale', 'revision_not_newer'),
      projection: null,
    }
  }

  const base = {
    version: 1 as const,
    entity_kind: input.event.entity.kind,
    entity_id: input.event.entity.id,
    source: input.event.source,
    revision: input.event.revision,
    last_event_id: input.event.event_id,
    applied_at: input.appliedAt,
  }
  const projection: DirectoryProjectionV1 =
    input.event.action === 'upsert'
      ? ({
          ...base,
          state: 'active',
          payload: input.event.payload,
          published_at: input.event.revision.source_event_time,
        } as DirectoryProjectionV1)
      : ({
          ...base,
          state: 'retired',
          retired_at: input.event.revision.source_event_time,
          retired_by_event_id: input.event.event_id,
        } as DirectoryProjectionV1)

  return {
    outcome: 'applied',
    reason: input.event.action === 'upsert' ? 'upsert_applied' : 'retire_applied',
    receipt: receipt(
      input,
      'applied',
      input.event.action === 'upsert' ? 'upsert_applied' : 'retire_applied'
    ),
    projection,
  }
}
