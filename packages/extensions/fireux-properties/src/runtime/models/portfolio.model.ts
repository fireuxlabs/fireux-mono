// FILE: packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * FireUX Canon (Consoleable, 2-layer)
 *
 * Core (root scope)
 * - Path: /portfolios/<portfolioId>
 * - Purpose: identity + portfolio facts (may still be private by rules; root != public)
 *
 * App (tenancy scope / private overlay)
 * - Path: /apps/<appId>/portfolios/<portfolioId>
 * - Purpose: governance + console/private switches + app-only controls
 *
 * Canon rules:
 * - Empty string means unset
 * - Arrays always exist
 * - Stamps use FireuxStamped nesting
 */

export const PortfolioCore = {
  id: '' as string,

  // Identity / display
  name: '' as string,

  // Optional human key (if you later add slugs, keep it here)
  slug: '' as string,

  // Portfolio facts (core)
  owner_label: '' as string,
  status: 'active' as 'active' | 'archived',
  strategy_label: '' as string,
  region_label: '' as string,
  notes: '' as string,

  // Stamps
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
  id: '' as string,

  // Governance (private)
  admin_ids: [] as string[],
  join_requests: [] as string[],

  // Console / ops (private)
  console_enabled: true as boolean,

  // Stamps
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

export type PortfolioModel = PortfolioCore
