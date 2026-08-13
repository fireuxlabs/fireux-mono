// Concurrent edit — 2026-07-20 22:18 CEST — Both-Entity Authority — Portfolio: separate canonical root identity from app access overlay.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify Portfolio root identity and access-only App support.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name Portfolio access support directly.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxAppAccessRecord } from 'fireux-core/runtime/models/utils/console-entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { FireuxAppAccessRecordModel } from 'fireux-core/runtime/models/utils/console-entity.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain
 * Storage: root canonical record plus app-scoped record
 * Root path: /portfolios/<portfolioId>
 * App path: /apps/<appId>/portfolios/<portfolioId>
 * Child scope: /apps/<appId>/portfolios/<portfolioId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Portfolio is one domain entity with a canonical root and an app-hosted support record.
 * - Root does not imply public access; public presentation remains a separate read contract.
 * - The app-scoped record exists because private and operational state can differ by app.
 * - If a future operator profile appears, it should remain a prerequisite or presentation layer over the same app-scoped pattern.
 * - Portfolio-owned operational children should live beneath the app-hosted record.
 * - If that changes later, update the models README first, then this file.
 */
export const PortfolioStorage = {
  shape: 'root-and-app-support',
  root: 'portfolios/{portfolioId}',
  appSupport: 'apps/{appId}/portfolios/{portfolioId}',
  rootCollection: 'portfolios',
  appSupportCollection: 'portfolios',
  idParam: 'portfolioId',
  children: {
    clients: 'apps/{appId}/portfolios/{portfolioId}/clients/{clientId}',
    compliance: 'apps/{appId}/portfolios/{portfolioId}/compliance-records/{complianceRecordId}',
    documents: 'apps/{appId}/portfolios/{portfolioId}/documents/{documentId}',
    tasks: 'apps/{appId}/portfolios/{portfolioId}/tasks/{taskId}',
    units: 'apps/{appId}/portfolios/{portfolioId}/units/{unitId}',
  },
} as const

export const PortfolioEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Portfolio',
  family: ['portfolio', 'console-entity'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'access-record',
  publicRead: 'to-confirm',
  console: true,
  root: PortfolioStorage.root,
  appSupportPath: PortfolioStorage.appSupport,
})

export const AppPortfolioStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/portfolios/{portfolioId}',
  collection: 'portfolios',
  parent: 'app',
  idParam: 'portfolioId',
} as const

export type PortfolioStatus = 'active' | 'archived'
export const PortfolioModel = {
  id: '',
  management: FireuxEntityManagementDefaults,

  name: '',
  tagline: '',
  image_url: '',
  slug: '',
  owner_label: '',
  status: 'active' as PortfolioStatus,
  strategy_label: '',
  region_label: '',
  notes: '',

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Portfolio = Omit<
  WidenLiteral<typeof PortfolioModel>,
  'management'
> & { management: FireuxEntityManagement }

export const AppPortfolioModel = {
  ...FireuxAppAccessRecordModel,
} as const

export type AppPortfolio = FireuxAppAccessRecord

export type PortfolioCreateInput = Omit<
  Portfolio,
  | 'id'
  | 'created'
  | 'updated'
  | 'management'
  | 'tagline'
  | 'image_url'
  | 'status'
  | 'slug'
> &
  Partial<
    Pick<
      Portfolio,
      | 'tagline'
      | 'image_url'
      | 'status'
      | 'slug'
    >
  >

export type PortfolioUpdateInput = Partial<
  Omit<
    Portfolio,
    | 'id'
    | 'created'
    | 'updated'
    | 'management'
  >
>
