import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? WidenLiteral<U>[]
        : T extends Record<string, unknown>
          ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
          : T

/**
 * Ownership map: docs/concepts/family-workspace-entity.md
 *
 * Family: Domain
 * Storage: root canonical record with root-owned Team and operations
 * Root path: /portfolios/<portfolioId>
 * Child scope: /portfolios/<portfolioId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Portfolio is one root domain Entity.
 * - Team, protected support, and operations remain beneath that root.
 * - Management may name an App host but never relocates the Portfolio.
 */
export const PortfolioStorage = {
  shape: 'root',
  root: 'portfolios/{portfolioId}',
  rootCollection: 'portfolios',
  idParam: 'portfolioId',
  children: {
    clients: 'portfolios/{portfolioId}/clients/{clientId}',
    compliance:
      'portfolios/{portfolioId}/compliance-records/{complianceRecordId}',
    documents: 'portfolios/{portfolioId}/documents/{documentId}',
    tasks: 'portfolios/{portfolioId}/tasks/{taskId}',
    units: 'portfolios/{portfolioId}/units/{unitId}',
  },
} as const

export const PortfolioEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Portfolio',
  family: ['portfolio', 'workspace-entity'],
  identity: 'root',
  authority: 'domain-database',
  appSupport: 'none',
  workspace: true,
  root: PortfolioStorage.root,
})

export const PortfolioTeamStorage = {
  shape: 'scoped',
  path: 'portfolios/{portfolioId}/team/{memberId}',
  collection: 'team',
  parent: 'portfolio',
  idParam: 'userId',
} as const

export type PortfolioStatus = 'active' | 'archived'
export const PortfolioModel = {
  id: '',
  management: FireuxEntityManagementDefaults,
  identity: {
    name: '',
    tagline: '',
    image_url: '',
    slug: '',
    owner_label: '',
    status: 'active' as PortfolioStatus,
    strategy_label: '',
    region_label: '',
    notes: '',
  },

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

export type PortfolioIdentity = Omit<
  WidenLiteral<typeof PortfolioModel.identity>, 'status'
> & { status: PortfolioStatus }

export type Portfolio = Omit<
  WidenLiteral<typeof PortfolioModel>, 'management' | 'identity'
> & { management: FireuxEntityManagement; identity: PortfolioIdentity }

export type PortfolioCreateInput = {
  identity: Pick<PortfolioIdentity, 'name'> & Partial<Omit<PortfolioIdentity, 'name'>>
}

export type PortfolioUpdateInput = {
  identity: Partial<Pick<PortfolioIdentity,
    'name' | 'tagline' | 'owner_label' | 'strategy_label' | 'region_label' | 'notes'
  >>
}
