// FILE: packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Console
 * Storage: root canonical record plus app overlay
 * Root path: /portfolios/<portfolioId>
 * Overlay path: /apps/<appId>/portfolios/<portfolioId>
 *
 * Decision note:
 * - Portfolio is one console entity with a root identity and an app-scoped operational overlay.
 * - The overlay exists because real governance and console state can differ by app.
 * - If that changes later, update the models README first, then this file.
 */

export type PortfolioStatus = 'active' | 'archived'
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
