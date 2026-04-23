import type { Portfolio } from '../../../../../../models/portfolio.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const DEFAULT_PORTFOLIO_IMAGE = '/img/core/brand/logo.png'

export type PortfolioSurface = Partial<Portfolio> & {
  id?: string
  image_url?: string
  avatar_url?: string
}

export namespace PortfolioCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarUrl: string
    title: string
    subtitle: string
    badges: string[]
    summary: string
    ownerLabel: string
    status: string
    shortName: string
    locationLabel: string
    regionLabel: string
  }
}

export function usePortfolioInterface() {
  type PortfolioPill = PortfolioCard.Card
  type PortfolioCell = PortfolioCard.Card
  type PortfolioPreview = PortfolioCard.Card
  type PortfolioProfile = PortfolioCard.Card

  function map(portfolio: PortfolioSurface): PortfolioCard.Card {
    const id = safeString(portfolio.id)
    const name = safeString(portfolio.name)
    const ownerLabel = safeString(portfolio.owner_label)
    const status = safeString(portfolio.status)
    const regionLabel = safeString(portfolio.region_label)
    const imageUrl =
      safeString(portfolio.image_url) ||
      safeString(portfolio.avatar_url) ||
      DEFAULT_PORTFOLIO_IMAGE

    return {
      id,
      to: id ? `/console/portfolio` : '',
      imageUrl,
      avatarUrl: imageUrl,
      title: name,
      subtitle: regionLabel,
      badges: [],
      summary: '',
      ownerLabel,
      status,
      shortName: '',
      locationLabel: regionLabel,
      regionLabel,
    }
  }

  function buildInterface(
    target?: PortfolioSurface | null | undefined
  ): PortfolioCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: PortfolioSurface | null | undefined): PortfolioPill | null {
    return buildInterface(target)
  }

  function cell(target?: PortfolioSurface | null | undefined): PortfolioCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: PortfolioSurface | null | undefined
  ): PortfolioPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: PortfolioSurface | null | undefined
  ): PortfolioProfile | null {
    return buildInterface(target)
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
