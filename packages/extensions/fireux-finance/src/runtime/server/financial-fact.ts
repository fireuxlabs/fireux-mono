// Concurrent edit — 2026-07-21 16:35 CEST — FireUX Finance pass: emit distributable deterministic fact helpers.
import { createHash } from 'node:crypto'
import {
  FinancialFactSchemaVersion,
  type FinancialFact,
  type FinancialFactActorKind,
} from '../models/financial-fact.model'
import type { FinancialMoney } from '../models/money.model'
import { requireFinancialMoney } from '../utils/money'

const FACT_KIND_PATTERN = /^[a-z][a-z0-9_]{0,63}$/

function requireFactKind(value: unknown, label: string): string {
  if (typeof value !== 'string' || !FACT_KIND_PATTERN.test(value)) {
    throw new Error(`${label} must be a lower-snake-case identifier.`)
  }
  return value
}

function requireDocumentId(value: unknown, label: string): string {
  if (
    typeof value !== 'string' ||
    !value ||
    value.length > 512 ||
    value === '.' ||
    value === '..' ||
    value.includes('/') ||
    /^__.*__$/.test(value)
  ) {
    throw new Error(`${label} must be a bounded Firestore document id.`)
  }
  return value
}

function requireRelativeDocumentPath(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value ||
    value.length > 4096 ||
    value.startsWith('/') ||
    value.endsWith('/')
  ) {
    throw new Error('Financial fact source path must be a relative document path.')
  }
  const segments = value.split('/')
  if (
    segments.length % 2 !== 0 ||
    !segments.every((segment) => {
      try {
        requireDocumentId(segment, 'Financial fact source path segment')
        return true
      } catch {
        return false
      }
    })
  ) {
    throw new Error('Financial fact source path must identify a document.')
  }
  return value
}

function requireDocumentPath(value: unknown, sourceId: string): string {
  const path = requireRelativeDocumentPath(value)
  if (path.split('/').at(-1) !== sourceId) {
    throw new Error('Financial fact source path must identify the declared source document.')
  }
  return path
}

export function financialFactId(input: {
  appId: string
  kind: string
  sourcePath: string
}): string {
  const appId = requireDocumentId(input.appId, 'Financial fact App id')
  const kind = requireFactKind(input.kind, 'Financial fact kind')
  const sourcePath = requireRelativeDocumentPath(input.sourcePath)
  const digest = createHash('sha256')
    .update(JSON.stringify([
      FinancialFactSchemaVersion,
      appId,
      kind,
      sourcePath,
    ]))
    .digest('hex')
  return `fact-v${FinancialFactSchemaVersion}-${digest}`
}

export function financialFactPath(appId: string, factId: string): string {
  return `apps/${requireDocumentId(appId, 'Financial fact App id')}` +
    `/financial-facts/${requireDocumentId(factId, 'Financial fact id')}`
}

export function buildFinancialFact<
  TKind extends string,
  TTimestamp,
>(input: {
  appId: string
  kind: TKind
  subject: { kind: string, id: string }
  source: { kind: string, id: string, path: string }
  money: FinancialMoney
  occurredAt: TTimestamp
  recordedAt: TTimestamp
  actor: { kind: FinancialFactActorKind, id: string }
}): FinancialFact<TKind, TTimestamp> {
  const appId = requireDocumentId(input.appId, 'Financial fact App id')
  const kind = requireFactKind(input.kind, 'Financial fact kind') as TKind
  const subjectKind = requireFactKind(
    input.subject.kind,
    'Financial fact subject kind'
  )
  const subjectId = requireDocumentId(
    input.subject.id,
    'Financial fact subject id'
  )
  const sourceKind = requireFactKind(
    input.source.kind,
    'Financial fact source kind'
  )
  const sourceId = requireDocumentId(
    input.source.id,
    'Financial fact source id'
  )
  const sourcePath = requireDocumentPath(input.source.path, sourceId)
  const actorId = requireDocumentId(input.actor.id, 'Financial fact actor id')
  if (input.actor.kind !== 'user' && input.actor.kind !== 'system') {
    throw new Error('Financial fact actor kind is invalid.')
  }
  if (input.occurredAt == null || input.recordedAt == null) {
    throw new Error('Financial fact timestamps are required.')
  }

  const money = requireFinancialMoney(input.money, {
    allowNegative: false,
    label: 'Financial fact money',
  })
  const id = financialFactId({ appId, kind, sourcePath })

  return {
    id,
    schema_version: FinancialFactSchemaVersion,
    app_id: appId,
    kind,
    subject: {
      kind: subjectKind,
      id: subjectId,
    },
    source: {
      kind: sourceKind,
      id: sourceId,
      path: sourcePath,
    },
    ...money,
    occurred_at: input.occurredAt,
    recorded_at: input.recordedAt,
    actor: {
      kind: input.actor.kind,
      id: actorId,
    },
  }
}
