import type {
  FireuxAppOverlay,
  FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'
import {
  FireuxConsoleAccessModel,
  FireuxAppOverlayModel,
  FireuxAppScope,
} from 'fireux-core/runtime/models/core/meta.model'
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
 * - Portfolio is one domain entity with a root public entity and an app-hosted portfolio record.
 * - Public facade depth can vary by family; Portfolio can stay intentionally minimal in public while still using the same root-plus-overlay pattern.
 * - The app-scoped record exists because private and operational state can differ by app.
 * - If a future operator profile appears, it should remain a prerequisite or presentation layer over the same app-scoped pattern.
 * - Portfolio-owned operational children should live beneath the app-hosted record.
 * - If that changes later, update the models README first, then this file.
 */
export const PortfolioStorage = {
  shape: 'both',
  root: 'portfolios/{portfolioId}',
  overlay: 'apps/{appId}/portfolios/{portfolioId}',
  rootCollection: 'portfolios',
  overlayCollection: 'portfolios',
  idParam: 'portfolioId',
  children: {
    clients: 'apps/{appId}/portfolios/{portfolioId}/clients/{clientId}',
    compliance: 'apps/{appId}/portfolios/{portfolioId}/compliance-records/{complianceRecordId}',
    documents: 'apps/{appId}/portfolios/{portfolioId}/documents/{documentId}',
    properties: 'apps/{appId}/portfolios/{portfolioId}/properties/{propertyId}',
    tasks: 'apps/{appId}/portfolios/{portfolioId}/tasks/{taskId}',
    units: 'apps/{appId}/portfolios/{portfolioId}/units/{unitId}',
  },
} as const

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
  ...FireuxAppScope,
  ...FireuxConsoleAccessModel,

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

export type Portfolio = WidenLiteral<typeof PortfolioModel>

export const AppPortfolioModel = {
  ...FireuxAppOverlayModel,
} as const

export type AppPortfolio = FireuxAppOverlay

export type PortfolioCreateInput = Omit<
  Portfolio,
  | 'id'
  | 'created'
  | 'updated'
  | 'app_scope_state'
  | 'app_scope_app_id'
  | 'operator_ids'
  | 'tagline'
  | 'image_url'
> &
  Partial<
    Pick<Portfolio, 'app_scope_state' | 'app_scope_app_id' | 'operator_ids' | 'tagline' | 'image_url'>
  > & {
    slug?: string
  }

export type PortfolioUpdateInput = Partial<Omit<Portfolio, 'id' | 'created' | 'updated'>>
