// FILE: packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export interface PortfolioCore {
  id: string
  name: string
  slug?: string
  owner_label: string
  status: 'active' | 'archived'
  strategy_label: string
  region_label: string
  notes: string
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
    app_id?: FireuxStamped['created']['app_id']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['updated']['by']
  }
}

export const PortfolioCore: PortfolioCore = {
  id: '',
  name: '',
  slug: '',
  owner_label: '',
  status: 'active',
  strategy_label: '',
  region_label: '',
  notes: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export interface PortfolioApp {
  id: string
  admin_ids: string[]
  join_requests: string[]
  console_enabled: boolean
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
    app_id?: FireuxStamped['created']['app_id']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['updated']['by']
  }
}

export const PortfolioApp: PortfolioApp = {
  id: '',
  admin_ids: [],
  join_requests: [],
  console_enabled: true,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type Portfolio = PortfolioCore
export type PortfolioModel = PortfolioCore
