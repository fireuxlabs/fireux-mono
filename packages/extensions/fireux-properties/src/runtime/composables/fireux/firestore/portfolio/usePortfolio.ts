// Concurrent edit — 2026-07-20 22:37 CEST — Supplier/Portfolio Authority Hardening: expose fixed reads and identity writes without unsafe lifecycle deletes.
import type { Ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioCollection } from './fetch/usePortfolioCollection'
import { useAppPortfolioFetch, usePortfolioFetch } from './fetch/usePortfolioFetch'
import { usePortfolioCreate } from './mutations/usePortfolioCreate'
import { usePortfolioUpdate } from './mutations/usePortfolioUpdate'
import { usePortfolioSeo } from './utils/usePortfolioSeo'
import { usePortfolioComputed } from './utils/view/usePortfolioComputed'
import { usePortfolioInterface } from './utils/view/usePortfolioInterface'

export type { Portfolio }
export type {
  PortfolioCollectionFilter,
  PortfolioCollectionSource,
} from './fetch/usePortfolioCollection'

export {
  usePortfolioCollection,
  usePortfolioFetch,
  useAppPortfolioFetch,
  usePortfolioCreate,
  usePortfolioUpdate,
  usePortfolioSeo,
  usePortfolioComputed,
  usePortfolioInterface,
}

export function usePortfolio(id: string | Ref<string>) {
  const fetched = usePortfolioFetch(id)

  return {
    ...fetched,
    ...usePortfolioCollection(),
    ...usePortfolioCreate(),
    ...usePortfolioUpdate(),
    ...usePortfolioComputed(fetched.portfolio),
    ...usePortfolioInterface(),
    usePortfolioSeo,
  }
}
