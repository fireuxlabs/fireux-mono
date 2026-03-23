import type { Portfolio } from '../../../../../../models/portfolio.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace PortfolioCard {
  export type Card = {
    id: string
    to: string
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
      to: id ? `/console/portfolio/overview` : '',
      avatarUrl: '',
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

  function buildInterface(target?: Portfolio | null | undefined): PortfolioCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: Portfolio | null | undefined): PortfolioPill | null {
    return buildInterface(target)
  }

  function cell(target?: Portfolio | null | undefined): PortfolioCell | null {
    return buildInterface(target)
  }

  function preview(target?: Portfolio | null | undefined): PortfolioPreview | null {
    return buildInterface(target)
  }

  function profile(target?: Portfolio | null | undefined): PortfolioProfile | null {
    return buildInterface(target)
  }

  function searchText(target: Portfolio): string {
    return [
      safeString(target.name),
      safeString(target.owner_label),
      safeString(target.region_label),
      safeString(target.id),
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { interface: buildInterface,
    pill,
    cell,
    preview,
    profile,
    searchText,
  }
}
