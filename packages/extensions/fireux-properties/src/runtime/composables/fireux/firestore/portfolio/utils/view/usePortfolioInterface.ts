// Concurrent edit — 2026-07-20 22:18 CEST — Both-Entity Authority — Portfolio: compose only app access delta onto canonical root identity.
import { safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import {
  PortfolioStorage,
  type AppPortfolio,
  type Portfolio,
} from '../../../../../../models/portfolio.model'

const safeString = (value: unknown) => String(value ?? '').trim()
type PortfolioAccessDelta = Partial<
  Pick<AppPortfolio, 'operator_ids' | 'team_ids' | 'join_requests'>
>
export type PortfolioSurface = Partial<Portfolio> & PortfolioAccessDelta
export type PortfolioSurfaceParts<
  TPortfolio extends Partial<Portfolio> = Partial<Portfolio>,
> = {
  portfolio?: TPortfolio | null | undefined
  overlay?: AppPortfolio | null | undefined
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
  type PortfolioIdentity = PortfolioCard.Card
  type PortfolioPill = PortfolioCard.Card
  type PortfolioCell = PortfolioCard.Card
  type PortfolioPreview = PortfolioCard.Card
  type PortfolioProfile = PortfolioCard.Card

  function surface<TPortfolio extends Partial<Portfolio> = Partial<Portfolio>>(
    parts: PortfolioSurfaceParts<TPortfolio>
  ): (TPortfolio & PortfolioSurface) | null {
    const source = parts.portfolio ?? null
    if (!source) return null

    const id = safeString(source.id)
    if (!id) return null
    const {
      operator_ids: _legacyOperatorIds,
      team_ids: _legacyTeamIds,
      join_requests: _legacyJoinRequests,
      ...root
    } = source as TPortfolio & Record<string, unknown>
    const overlay = parts.overlay
    const accessDelta: PortfolioAccessDelta = overlay
      ? {
          operator_ids: safeStringArray(overlay.operator_ids),
          team_ids: safeStringArray(overlay.team_ids),
          join_requests: safeStringArray(overlay.join_requests),
        }
      : {}

    return {
      ...root,
      ...accessDelta,
      id,
    } as TPortfolio & PortfolioSurface
  }

  function map(portfolio: PortfolioSurface): PortfolioCard.Card {
    const id = safeString(portfolio.id)
    const name = safeString(portfolio.name)
    const ownerLabel = safeString(portfolio.owner_label)
    const status = safeString(portfolio.status)
    const regionLabel = safeString(portfolio.region_label)

    return {
      id,
      to: id ? `/${PortfolioStorage.rootCollection}/${encodeURIComponent(id)}` : '',
      imageUrl: '',
      avatarUrl: '',
      title: name,
      subtitle: regionLabel,
      badges: [],
      summary: safeString(portfolio.notes),
      ownerLabel,
      status,
      shortName: safeString(portfolio.slug),
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
    return identity(target)
  }

  return {
    surface,
    interface: toInterface,
    identity,
    pill,
    cell,
    preview,
    profile,
  }
}
