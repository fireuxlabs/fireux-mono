// Concurrent edit — 2026-07-19 22:10 CEST — Directory Publication Rules Pass: scope machine authorization by subject and canonical source.

import { createHash } from 'node:crypto'
import type { Firestore } from 'firebase-admin/firestore'
import {
  DirectoryPublicationStorage,
  type DirectoryPublicationSourceV1,
  type DirectoryProjectionV1,
  type DirectoryPublicationDecisionOutcome,
  type DirectoryPublicationV1,
  type DirectoryPublisherPrincipalV1,
} from '../../../models/operations/directory-publication'
import { reduceDirectoryPublication } from './reduce'
import {
  DirectoryPublicationValidationError,
  parseDirectoryProjectionV1,
  parseDirectorySourceAuthorizationV1,
} from './validate'

export class DirectoryPublicationAuthorizationError extends Error {
  readonly code = 'directory_publication_not_authorized'
}

export class DirectoryPublicationStateError extends Error {
  readonly code = 'directory_publication_state_invalid'
}

export type ApplyDirectoryPublicationResult = {
  outcome: DirectoryPublicationDecisionOutcome
  reason: string
}

function digestDirectoryPublicationIdentity(...parts: string[]) {
  const hash = createHash('sha256')
  for (const part of parts) hash.update(part).update('\0')
  return hash.digest('hex')
}

export function directoryPublicationSourceAuthorizationId(
  oidcSubject: string,
  source: DirectoryPublicationSourceV1
) {
  return digestDirectoryPublicationIdentity(
    oidcSubject,
    source.firebase_project_id,
    source.database_id,
    source.project_id,
    source.ecosystem_id || ''
  )
}

export function directoryPublicationReceiptId(
  authorizationId: string,
  eventId: string
) {
  return digestDirectoryPublicationIdentity(authorizationId, eventId)
}

function projectionCollection(event: DirectoryPublicationV1) {
  return event.entity.kind === 'app'
    ? DirectoryPublicationStorage.appProjections
    : DirectoryPublicationStorage.ecosystemProjections
}

function parseStoredProjection(value: unknown): DirectoryProjectionV1 {
  try {
    return parseDirectoryProjectionV1(value)
  } catch (error) {
    if (error instanceof DirectoryPublicationValidationError) {
      throw new DirectoryPublicationStateError(
        'The stored directory projection is invalid.'
      )
    }
    throw error
  }
}

/**
 * Applies one already-validated publication in a single Firestore transaction.
 * Source authorization is re-read inside the transaction; curation is never
 * read or written by this machine-owned path.
 */
export async function applyDirectoryPublicationTransaction(input: {
  db: Firestore
  event: DirectoryPublicationV1
  principal: DirectoryPublisherPrincipalV1
  appliedAt?: string
}): Promise<ApplyDirectoryPublicationResult> {
  const { db, event, principal } = input
  const appliedAt = input.appliedAt || new Date().toISOString()
  const authorizationId = directoryPublicationSourceAuthorizationId(
    principal.oidc_subject,
    event.source
  )
  const sourceRef = db
    .collection(DirectoryPublicationStorage.sources)
    .doc(authorizationId)
  const receiptRef = db
    .collection(DirectoryPublicationStorage.receipts)
    .doc(directoryPublicationReceiptId(authorizationId, event.event_id))
  const projectionRef = db
    .collection(projectionCollection(event))
    .doc(event.entity.id)

  return db.runTransaction(async (transaction) => {
    const [sourceSnapshot, receiptSnapshot, projectionSnapshot] =
      await Promise.all([
        transaction.get(sourceRef),
        transaction.get(receiptRef),
        transaction.get(projectionRef),
      ])

    if (!sourceSnapshot.exists) {
      throw new DirectoryPublicationAuthorizationError(
        'The publication source is not authorized.'
      )
    }

    let authorization
    try {
      authorization = parseDirectorySourceAuthorizationV1(
        sourceSnapshot.data()
      )
    } catch (error) {
      if (error instanceof DirectoryPublicationValidationError) {
        throw new DirectoryPublicationAuthorizationError(
          'The publication source is not authorized.'
        )
      }
      throw error
    }
    if (authorization.authorization_id !== sourceRef.id) {
      throw new DirectoryPublicationAuthorizationError(
        'The publication source is not authorized.'
      )
    }

    const currentProjection = !receiptSnapshot.exists && projectionSnapshot.exists
      ? parseStoredProjection(projectionSnapshot.data())
      : null
    if (
      currentProjection &&
      (currentProjection.entity_kind !== event.entity.kind ||
        currentProjection.entity_id !== event.entity.id)
    ) {
      throw new DirectoryPublicationStateError(
        'The stored directory projection identity is invalid.'
      )
    }
    const reduction = reduceDirectoryPublication({
      event,
      authorization,
      principal,
      currentProjection,
      receiptExists: receiptSnapshot.exists,
      appliedAt,
    })

    if (reduction.outcome === 'rejected') {
      throw new DirectoryPublicationAuthorizationError(
        'The publication source is not authorized.'
      )
    }

    if (reduction.receipt) {
      transaction.create(receiptRef, reduction.receipt)
    }
    if (reduction.projection) {
      transaction.set(projectionRef, reduction.projection)
    }

    return {
      outcome: reduction.outcome,
      reason: reduction.reason,
    }
  })
}
