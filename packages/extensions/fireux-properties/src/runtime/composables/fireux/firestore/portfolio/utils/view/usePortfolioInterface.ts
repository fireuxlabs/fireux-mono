import type { Portfolio } from '../../../../../../models/portfolio.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const DEFAULT_PORTFOLIO_IMAGE = '/img/core/brand/logo.png'

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

  function map(portfolio: Portfolio): PortfolioCard.Card {
    const id = safeString(portfolio.id)
    const name = safeString(portfolio.name)
    const ownerLabel = safeString(portfolio.owner_label)
    const status = safeString(portfolio.status)
    const regionLabel = safeString(portfolio.region_label)

    return {
      id,
      to: id ? `/console/portfolio` : '',
      imageUrl: DEFAULT_PORTFOLIO_IMAGE,
      avatarUrl: DEFAULT_PORTFOLIO_IMAGE,
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
    target?: Portfolio | null | undefined
  ): PortfolioCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: Portfolio | null | undefined): PortfolioPill | null {
    return buildInterface(target)
  }

  function cell(target?: Portfolio | null | undefined): PortfolioCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: Portfolio | null | undefined
  ): PortfolioPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: Portfolio | null | undefined
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
