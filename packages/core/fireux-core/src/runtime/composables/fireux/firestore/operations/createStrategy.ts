// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: classify access-support creation explicitly.
export type FireuxCreateFamily =
  | 'idempotent'
  | 'with_provision'

export type FireuxCreateTransport = 'client' | 'server'
export type FireuxCreateLocation = 'root' | 'scoped' | 'app-support'
export type FireuxCreateIdStrategy = 'generated' | 'known'
export type FireuxCreateSteps = 'single' | 'multi'

export type FireuxCreatePlan = {
  family: FireuxCreateFamily
  transport?: FireuxCreateTransport | FireuxCreateTransport[]
  location?: FireuxCreateLocation | FireuxCreateLocation[]
  id?: FireuxCreateIdStrategy | FireuxCreateIdStrategy[]
  steps?: FireuxCreateSteps
}

export const defineFireuxCreatePlan = <T extends FireuxCreatePlan>(plan: T): T => plan
