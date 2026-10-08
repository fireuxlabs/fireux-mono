// Concurrent edit — 2026-07-20 22:18 CEST — Both-Entity Authority — Portfolio: compose only app access delta onto canonical root identity.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name the allowlisted App access input directly.
import {
  PortfolioStorage,
} from '../../../../models/portfolio.model.ts'
import type { PortfolioPublicSummary } from '../../../../models/portfolio-read.model'

const safeString = (value: unknown) => String(value ?? '').trim()
export type PortfolioSurface = PortfolioPublicSummary

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
  type PortfolioIdentity = PortfolioCard.Card
  type PortfolioPill = PortfolioCard.Card
  type PortfolioCell = PortfolioCard.Card
  type PortfolioPreview = PortfolioCard.Card
  type PortfolioProfile = PortfolioCard.Card

  function map(portfolio: PortfolioSurface): PortfolioCard.Card {
    const id = safeString(portfolio.id)
    const name = safeString(portfolio.identity.name)
    const ownerLabel = ''
    const status = safeString(portfolio.identity.status)
    const regionLabel = safeString(portfolio.identity.region_label)

    return {
      id,
      to: id
        ? `/${PortfolioStorage.rootCollection}/${encodeURIComponent(id)}`
        : '',
      imageUrl: safeString(portfolio.identity.image_url),
      avatarUrl: safeString(portfolio.identity.image_url),
      title: name,
      subtitle: regionLabel,
      badges: [],
      summary: safeString(portfolio.identity.tagline),
      ownerLabel,
      status,
      shortName: safeString(portfolio.identity.slug),
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

  function identity(
    target?: PortfolioSurface | null | undefined
  ): PortfolioIdentity | null {
    return buildInterface(target)
  }

  function pill(
    target?: PortfolioSurface | null | undefined
  ): PortfolioPill | null {
    return buildInterface(target)
  }

  function cell(
    target?: PortfolioSurface | null | undefined
  ): PortfolioCell | null {
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
    return identity(target)
  }

  return {
    interface: toInterface,
    identity,
    pill,
    cell,
    preview,
    profile,
  }
}
