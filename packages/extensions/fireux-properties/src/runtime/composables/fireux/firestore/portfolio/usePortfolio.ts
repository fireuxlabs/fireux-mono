import type { Ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioCollection } from './fetch/usePortfolioCollection'
import { usePortfolioFetch } from './fetch/usePortfolioFetch'
import { usePortfolioCreate } from './mutations/usePortfolioCreate'
import { usePortfolioDelete } from './mutations/usePortfolioDelete'
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
  usePortfolioCreate,
  usePortfolioDelete,
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
    ...usePortfolioDelete(),
    ...usePortfolioUpdate(),
    ...usePortfolioComputed(fetched.portfolio),
    ...usePortfolioInterface(),
    usePortfolioSeo,
  }
}
