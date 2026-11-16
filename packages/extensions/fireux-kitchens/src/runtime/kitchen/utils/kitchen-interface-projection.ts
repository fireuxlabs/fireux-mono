import type { KitchenDirectoryEntry } from '../types/public'
import type { CollectionCellData } from 'fireux-core/runtime/types/collection-cell'
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'

export const resolveKitchenPath = (target: {
  id?: string
  slug?: string
  route_scope?: 'live' | 'demo' | 'test'
}) => {
  const slug = safeString(target.slug)
  if (!slug) return ''

  if (target.route_scope === 'demo' || target.route_scope === 'test') {
    return ''
  }

  return `/kitchens/${encodeURIComponent(slug)}`
}

/** Supplied discovery facts needed by the public Kitchen collection. */
export type KitchenCollectionCard = {
  name: string
  tagline: string
  discoveryImageUrl: string
  shortAddress: string
  badges: string[]
  categoryLabels: string[]
  serviceLabels: string[]
  hasPublishedMenu: boolean
  special?: KitchenDirectoryEntry['special']
  to: string
}

export function toKitchenCollectionCell(
  card: KitchenCollectionCard
): CollectionCellData {
  return {
    title: card.name,
    description: card.tagline,
    image: card.discoveryImageUrl,
    imageStyle: 'cover',
    fallbackIcon: 'i-lucide-utensils',
    meta: card.shortAddress,
    badges: [...new Set([...card.badges, ...card.categoryLabels])],
    actionLabel: 'View menus',
    to: card.to ? `${card.to.replace(/\/$/, '')}/menu` : '',
  }
}
