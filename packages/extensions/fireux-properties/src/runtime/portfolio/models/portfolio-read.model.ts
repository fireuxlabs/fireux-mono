import type { PortfolioIdentity } from './portfolio.model.ts'

/** Public identity only; management, notes, strategy and audit stamps stay private. */
export type PortfolioPublicSummary = {
  id: string
  identity: Pick<PortfolioIdentity,
    'slug' | 'name' | 'tagline' | 'image_url' | 'region_label' | 'status'
  >
}
export type PortfolioDirectoryPage = {
  items: PortfolioPublicSummary[]
  nextCursor?: string
}
export type PortfolioDetailResponse = { portfolio: PortfolioPublicSummary }
