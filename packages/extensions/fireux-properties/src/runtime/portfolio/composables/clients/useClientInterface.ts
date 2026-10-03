import type { Client } from '../../models/client.model.ts'

const safeString = (value: unknown) => String(value ?? '').trim()
const clientAvatarPlaceholder = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(`fireux-client-${seed || 'placeholder'}`)}`
const labelize = (value: string) =>
  safeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

const formatRent = (amount: number, currencyCode: string) => {
  const resolved = safeString(currencyCode).toUpperCase() || 'GBP'
  const value = Number(amount || 0)

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: resolved,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${resolved} ${Math.round(value).toLocaleString('en-GB')}`
  }
}

export namespace ClientCard {
  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    meta: string
    imageUrl: string
    status: string
    badges: string[]
    summary: string
  }
}

export function useClientInterface() {
  type ClientPill = ClientCard.Card
  type ClientCell = ClientCard.Card
  type ClientPreview = ClientCard.Card
  type ClientProfile = ClientCard.Card

  function buildInterface(
    target?: Client | null | undefined
  ): ClientCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    const title =
      safeString(target.display_name) ||
      safeString(target.trading_name) ||
      safeString(target.legal_name) ||
      id
    const entityType = labelize(safeString(target.entity_type))
    const relationship = labelize(safeString(target.relationship_status))
    const jurisdiction = safeString(target.jurisdiction)
    const multiProperty =
      Array.isArray(target.property_ids) && target.property_ids.length > 1
        ? `${target.property_ids.length} properties`
        : ''
    const subtitle =
      [
        entityType || 'Organization',
        relationship,
        jurisdiction,
        multiProperty || safeString(target.property_label),
      ]
        .filter(Boolean)
        .join(' · ') || 'No property mapping'

    const metaParts = [
      safeString(target.status),
      formatRent(
        Number(target.monthly_rent || 0),
        safeString(target.currency || 'GBP')
      ),
    ]

    const leaseEnd = safeString(target.lease_end_date)
    if (leaseEnd) metaParts.push(`lease ends ${leaseEnd}`)

    return {
      id,
      to: '',
      title,
      subtitle,
      meta: metaParts.filter(Boolean).join(' · '),
      imageUrl: safeString(target.avatar_url) || clientAvatarPlaceholder(id),
      status: safeString(target.status) || 'active',
      badges: [],
      summary: '',
    }
  }

  const toInterface = buildInterface

  function pill(target?: Client | null | undefined): ClientPill | null {
    return buildInterface(target)
  }

  function cell(target?: Client | null | undefined): ClientCell | null {
    return buildInterface(target)
  }

  function preview(target?: Client | null | undefined): ClientPreview | null {
    return buildInterface(target)
  }

  function profile(target?: Client | null | undefined): ClientProfile | null {
    return buildInterface(target)
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
