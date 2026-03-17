// FILE: packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type PortfolioStatus = 'active' | 'archived'

/**
 * Entity Class: Dual-Layer
 * Core Path: /portfolios/<portfolioId>
 * App Path: /apps/<appId>/portfolios/<portfolioId>
 */
export const PortfolioCore = {
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
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type PortfolioCore = {
  [K in keyof typeof PortfolioCore]: (typeof PortfolioCore)[K]
}

export const PortfolioApp = {
  id: '',
  admin_ids: [] as string[],
  join_requests: [] as string[],
  console_enabled: true as boolean,
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

export type PortfolioApp = {
  [K in keyof typeof PortfolioApp]: (typeof PortfolioApp)[K]
}

export type Portfolio = PortfolioCore
