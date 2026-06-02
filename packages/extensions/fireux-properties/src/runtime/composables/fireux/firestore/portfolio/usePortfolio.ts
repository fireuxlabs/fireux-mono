import type { Ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioCollection } from './fetch/usePortfolioCollection'
import { usePortfolioFetch } from './fetch/usePortfolioFetch'
import { usePortfolioCreate } from './mutations/usePortfolioCreate'
import { usePortfolioDelete } from './mutations/usePortfolioDelete'
import { usePortfolioUpdate } from './mutations/usePortfolioUpdate'
import { usePortfolioSeo } from './utils/usePortfolioSeo'
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
    ...usePortfolioInterface(),
    usePortfolioSeo,
  }
}
