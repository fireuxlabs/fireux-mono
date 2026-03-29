import { FireuxConsoleOverlay, type FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Console
 * Storage: root canonical record plus app overlay
 * Root path: /portfolios/<portfolioId>
 * Overlay path: /apps/<appId>/portfolios/<portfolioId>
 * Child scope: /apps/<appId>/portfolios/<portfolioId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Portfolio is one domain entity with a root public entity and an app-hosted portfolio console overlay.
 * - Public facade depth can vary by family; Portfolio can stay intentionally minimal in public while still using the same root-plus-overlay pattern.
 * - The overlay exists because real governance and console state can differ by app.
 * - Console authority stays user-based in the overlay; if a future operator profile appears, it should remain a prerequisite or presentation layer over the same overlay pattern.
 * - Portfolio-owned operational children should live beneath the app-hosted overlay.
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

export const ConsolePortfolioModel = {
  ...FireuxConsoleOverlay,
} as const

export type ConsolePortfolio = {
  [K in keyof typeof ConsolePortfolioModel]: (typeof ConsolePortfolioModel)[K]
}

export type PortfolioCreateInput = Omit<Portfolio, 'id' | 'created' | 'updated'> & {
  slug?: string
}

export type PortfolioUpdateInput = Partial<Omit<Portfolio, 'id' | 'created' | 'updated'>>
