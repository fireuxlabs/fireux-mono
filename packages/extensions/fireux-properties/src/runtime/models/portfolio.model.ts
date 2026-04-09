import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

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

export type PortfolioStatus = 'active' | 'archived'
export const PortfolioModel = {
  id: '',

  name: '',
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

export type Portfolio = {
  [K in keyof typeof PortfolioModel]: (typeof PortfolioModel)[K]
}

export const AppPortfolioModel = {
  id: '',
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

export type AppPortfolio = {
  [K in keyof typeof AppPortfolioModel]: (typeof AppPortfolioModel)[K]
}

export type PortfolioCreateInput = Omit<Portfolio, 'id' | 'created' | 'updated'> & {
  slug?: string
}

export type PortfolioUpdateInput = Partial<Omit<Portfolio, 'id' | 'created' | 'updated'>>
