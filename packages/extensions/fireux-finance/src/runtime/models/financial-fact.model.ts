// Concurrent edit — 2026-07-21 16:35 CEST — FireUX Finance pass: define distributable immutable App-scoped financial facts.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FinancialMoney } from './money.model'

/**
 * Family: App-scoped financial support record
 * Storage: append-only fact, not an entity or general-ledger entry
 * Path: apps/{appId}/financial-facts/{factId}
 */
export const FinancialFactStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/financial-facts/{factId}',
  collection: 'financial-facts',
  parent: 'app',
  idParam: 'factId',
} as const

export const FinancialFactSchemaVersion = 1 as const

export type FinancialFactActorKind = 'user' | 'system'

export type FinancialFact<
  TKind extends string = string,
  TTimestamp = FirebaseTimestamp,
> = FinancialMoney & {
  id: string
  schema_version: typeof FinancialFactSchemaVersion
  app_id: string
  kind: TKind
  subject: {
    kind: string
    id: string
  }
  source: {
    kind: string
    id: string
    path: string
  }
  occurred_at: TTimestamp
  recorded_at: TTimestamp
  actor: {
    kind: FinancialFactActorKind
    id: string
  }
}
