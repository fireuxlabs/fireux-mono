import type { Ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioCollection } from './fetch/usePortfolioCollection'
import { usePortfolioFetch } from './fetch/usePortfolioFetch'
import { usePortfolioCreate } from './mutations/usePortfolioCreate'
import { usePortfolioUpdate } from './mutations/usePortfolioUpdate'
import { usePortfolioSeo } from './utils/usePortfolioSeo'
import { usePortfolioInterface } from './utils/view/usePortfolioInterface'

export type { Portfolio }

export {
  usePortfolioCollection,
  usePortfolioFetch,
  usePortfolioCreate,
  usePortfolioUpdate,
  usePortfolioSeo,
  usePortfolioInterface,
}

export function usePortfolio(id: string | Ref<string>) {
  const fetched = usePortfolioFetch(id)

  return {
    ...fetched,
    ...usePortfolioCollection(),
    ...usePortfolioCreate(),
    ...usePortfolioUpdate(),
    ...usePortfolioInterface(),
    usePortfolioSeo,
  }
}
