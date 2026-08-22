import type { Portfolio } from './portfolio.model.ts'

export type PortfolioDirectoryPage = {
  items: Portfolio[]
  nextCursor?: string
}

export type PortfolioDetailResponse = {
  portfolio: Portfolio
}
