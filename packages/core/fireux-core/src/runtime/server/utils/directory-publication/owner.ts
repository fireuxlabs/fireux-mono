// Concurrent edit — 2026-07-19 22:10 CEST — Directory Publication Rules Pass: move outbox writes to a dedicated server-only database.

import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { GoogleAuth } from 'google-auth-library'
import {
  DirectoryPublicationDatabases,
  DirectoryPublicationOwnerStorage,
  type DirectoryEntityKind,
  type DirectoryPublicationOutboxV1,
  type DirectoryPublicationSourceV1,
  type DirectoryPublicationV1,
} from '../../../models/core/supporting/directory-publication'
import {
  buildDirectoryPublicationEvent as buildDirectoryPublication,
  directoryPublicationBuilderPrimitives,
  sha256,
} from './publication-builder'

const { record, text } = directoryPublicationBuilderPrimitives

export { buildDirectoryPublicationEvent as buildDirectoryPublication } from './publication-builder'

export type DirectoryPublisherConfig = {
  /** Must be explicitly true. The factory is not registered by any module. */
  enabled: boolean
  region: string
  /** Canonical entity database watched by the trigger. */
  databaseId: string
  /** Dedicated server-only database used for delivery state. */
  outboxDatabaseId: string
  /** Dedicated publisher identity; never use a platform receiver identity. */
  serviceAccount: string
  receiverUrl: string
  oidcAudience: string
  source: DirectoryPublicationSourceV1
  allowedAppIds: readonly string[]
  allowedEcosystemIds: readonly string[]
}

export type DirectoryPublicationDeliveryResult = {
  delivered: boolean
  retryable: boolean
  statusCode: number | null
}

function outboxId(event: DirectoryPublicationV1) {
  return sha256(event.event_id)
}

function parseOutbox(value: unknown): DirectoryPublicationOutboxV1 {
  const source = record(value)
  const delivery = record(source.delivery)
  const state = delivery.state
  const attempts = Number(delivery.attempts)
  if (
    source.version !== 1 ||
    !source.event ||
    (state !== 'pending' && state !== 'delivered' && state !== 'failed') ||
    !Number.isSafeInteger(attempts) ||
    attempts < 0
  ) {
    throw new Error('Directory publication outbox state is invalid.')
  }
  return source as DirectoryPublicationOutboxV1
}

export async function captureDirectoryPublicationOutbox(
  db: Firestore,
  event: DirectoryPublicationV1,
  now = new Date().toISOString()
) {
  const id = outboxId(event)
  const ref = db.collection(DirectoryPublicationOwnerStorage.outbox).doc(id)
  const outbox = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (snapshot.exists) {
      const existing = parseOutbox(snapshot.data())
      if (JSON.stringify(existing.event) !== JSON.stringify(event)) {
        throw new Error('Directory publication outbox id collision.')
      }
      return existing
    }

    const created: DirectoryPublicationOutboxV1 = {
      version: 1,
      event,
      delivery: {
        state: 'pending',
        attempts: 0,
        created_at: now,
        updated_at: now,
      },
    }
    transaction.create(ref, created)
    return created
  })

  return { id, outbox }
}

async function beginDelivery(db: Firestore, id: string) {
  const ref = db.collection(DirectoryPublicationOwnerStorage.outbox).doc(id)
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) {
      throw new Error('Directory publication outbox record is missing.')
    }
    const outbox = parseOutbox(snapshot.data())
    if (outbox.delivery.state === 'delivered') return null

    const next: DirectoryPublicationOutboxV1 = {
      ...outbox,
      delivery: {
        ...outbox.delivery,
        state: 'pending',
        attempts: outbox.delivery.attempts + 1,
        updated_at: new Date().toISOString(),
      },
    }
    transaction.set(ref, next)
    return next
  })
}

async function finishDelivery(input: {
  db: Firestore
  id: string
  delivered: boolean
  retryable: boolean
  errorCode?: string
}) {
  const ref = input.db
    .collection(DirectoryPublicationOwnerStorage.outbox)
    .doc(input.id)
  await input.db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) {
      throw new Error('Directory publication outbox record is missing.')
    }
    const outbox = parseOutbox(snapshot.data())
    if (!input.delivered && outbox.delivery.state === 'delivered') return

    const now = new Date().toISOString()
    const delivery: DirectoryPublicationOutboxV1['delivery'] = input.delivered
      ? {
          ...outbox.delivery,
          state: 'delivered',
          updated_at: now,
          delivered_at: now,
        }
      : {
          ...outbox.delivery,
          state: 'failed',
          updated_at: now,
          last_error_code: input.errorCode || 'delivery_failed',
          retryable: input.retryable,
        }
    transaction.set(ref, { ...outbox, delivery })
  })
}

export async function dispatchDirectoryPublicationOutbox(input: {
  db: Firestore
  id: string
  receiverUrl: string
  oidcAudience: string
  auth?: GoogleAuth
}): Promise<DirectoryPublicationDeliveryResult> {
  const outbox = await beginDelivery(input.db, input.id)
  if (!outbox) {
    return { delivered: true, retryable: false, statusCode: null }
  }

  let statusCode: number
  try {
    const auth = input.auth || new GoogleAuth()
    const client = await auth.getIdTokenClient(input.oidcAudience)
    const response = await client.request<unknown>({
      url: input.receiverUrl,
      method: 'POST',
      data: outbox.event,
      validateStatus: () => true,
    })
    statusCode = response.status
  } catch {
    await finishDelivery({
      db: input.db,
      id: input.id,
      delivered: false,
      retryable: true,
      errorCode: 'network_error',
    })
    throw new Error('Directory publication delivery failed.')
  }

  if (statusCode >= 200 && statusCode < 300) {
    await finishDelivery({
      db: input.db,
      id: input.id,
      delivered: true,
      retryable: false,
    })
    return { delivered: true, retryable: false, statusCode }
  }

  const retryable = statusCode === 429 || statusCode >= 500
  await finishDelivery({
    db: input.db,
    id: input.id,
    delivered: false,
    retryable,
    errorCode: `http_${statusCode}`,
  })
  if (retryable) {
    throw new Error('Directory publication delivery failed.')
  }
  return { delivered: false, retryable: false, statusCode }
}

function validatePublisherConfig(config: DirectoryPublisherConfig) {
  const pathSegment = (value: string) =>
    Boolean(value && value !== '.' && value !== '..' && !value.includes('/'))
  const allAllowedIds = [...config.allowedAppIds, ...config.allowedEcosystemIds]
  if (config.databaseId !== config.source.database_id) {
    throw new Error('Directory publisher database identity is inconsistent.')
  }
  if (
    config.outboxDatabaseId !== DirectoryPublicationDatabases.ownerOutbox ||
    config.outboxDatabaseId === config.databaseId
  ) {
    throw new Error('Directory publisher outbox database is not isolated.')
  }
  const [serviceAccountId, serviceAccountDomain, ...extraAccountParts] =
    config.serviceAccount.split('@')
  if (
    !config.region ||
    !pathSegment(config.databaseId) ||
    !pathSegment(config.outboxDatabaseId) ||
    !pathSegment(config.source.firebase_project_id) ||
    !pathSegment(config.source.project_id) ||
    (config.source.ecosystem_id && !pathSegment(config.source.ecosystem_id)) ||
    allAllowedIds.some((id) => !pathSegment(id)) ||
    new Set(config.allowedAppIds).size !== config.allowedAppIds.length ||
    new Set(config.allowedEcosystemIds).size !==
      config.allowedEcosystemIds.length ||
    extraAccountParts.length > 0 ||
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(serviceAccountId || '') ||
    serviceAccountDomain !==
      `${config.source.firebase_project_id}.iam.gserviceaccount.com`
  ) {
    throw new Error('Directory publisher static identity is invalid.')
  }
  if (
    config.allowedEcosystemIds.some((id) => id !== config.source.ecosystem_id)
  ) {
    throw new Error('Directory publisher Ecosystem allowlist is inconsistent.')
  }
  if (config.enabled) {
    const receiver = new URL(config.receiverUrl)
    const audience = new URL(config.oidcAudience)
    if (receiver.protocol !== 'https:' || audience.protocol !== 'https:') {
      throw new Error('Directory publisher endpoints must use HTTPS.')
    }
  }
}

/**
 * Dormant factory for a future separate Firebase Functions codebase. Importing
 * this file does not register a function; no current module/firebase.json calls
 * this factory.
 */
export function createDirectoryPublisherFunctions(
  config: DirectoryPublisherConfig
) {
  validatePublisherConfig(config)

  const handler = (kind: DirectoryEntityKind) => async (cloudEvent: any) => {
    if (!config.enabled) return
    if (
      cloudEvent.project !== config.source.firebase_project_id ||
      cloudEvent.database !== config.source.database_id
    ) {
      throw new Error('Directory publisher event source is inconsistent.')
    }

    const change = cloudEvent.data
    const before = change?.before
    const after = change?.after
    const entityId = text(cloudEvent.params?.entityId)
    const canonicalDb: Firestore | undefined =
      after?.ref?.firestore || before?.ref?.firestore
    if (!entityId || !canonicalDb) return

    const publication = buildDirectoryPublication({
      kind,
      entityId,
      cloudEventId: text(cloudEvent.id),
      cloudEventSource: text(cloudEvent.source),
      cloudEventTime: text(cloudEvent.time),
      beforeExists: Boolean(before?.exists),
      beforeData: before?.data(),
      afterExists: Boolean(after?.exists),
      afterData: after?.data(),
      config,
    })
    if (!publication) return

    const outboxDb = getFirestore(config.outboxDatabaseId)
    const captured = await captureDirectoryPublicationOutbox(
      outboxDb,
      publication
    )
    if (captured.outbox.delivery.state === 'delivered') return
    await dispatchDirectoryPublicationOutbox({
      db: outboxDb,
      id: captured.id,
      receiverUrl: config.receiverUrl,
      oidcAudience: config.oidcAudience,
    })
  }

  return {
    app: onDocumentWritten(
      {
        document: 'apps/{entityId}',
        database: config.databaseId,
        region: config.region,
        retry: true,
        serviceAccount: config.serviceAccount,
      },
      handler('app')
    ),
    ecosystem: onDocumentWritten(
      {
        document: 'ecosystems/{entityId}',
        database: config.databaseId,
        region: config.region,
        retry: true,
        serviceAccount: config.serviceAccount,
      },
      handler('ecosystem')
    ),
  }
}
