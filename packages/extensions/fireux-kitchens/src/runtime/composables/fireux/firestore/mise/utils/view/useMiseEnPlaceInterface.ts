import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { KitchenMiseTask } from '../../../../../../models/kitchen-mise.model'

const joinSubtitle = (station: string, serviceDate: string): string =>
  [safeString(station).trim(), safeString(serviceDate).trim()].filter(Boolean).join(' · ')

export namespace MiseEnPlaceCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    badges: string[]
    name: string
    description: string
    category: string
    unit: string
    status: string
    tags: string[]
  }
}

export type MiseEnPlaceProfile = {
  card: MiseEnPlaceCard.Card
  title: string
  subtitle: string
  prop?: string
  category: string
  unit: string
  status: string
  tags: string[]
}

export function useMiseEnPlaceInterface() {
  type MiseEnPlacePill = MiseEnPlaceCard.Card

  type MiseEnPlaceCell = Pick<
    MiseEnPlaceCard.Card,
    | 'id'
    | 'to'
    | 'imageUrl'
    | 'name'
    | 'subtitle'
    | 'status'
    | 'category'
    | 'unit'
  > & {
    prop?: string
  }

  type MiseEnPlacePreview = {
    imageUrl: string
    name: string
    subtitle: string
    status: string
    prop?: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  function map(task: KitchenMiseTask): MiseEnPlaceCard.Card {
    const id = safeString(task.id).trim()
    const name = safeString(task.title).trim() || id
    const category = safeString(task.station).trim()
    const unit = Number(task.estimated_minutes || 0) > 0 ? `${Number(task.estimated_minutes)}m` : ''
    const status = safeString(task.status).trim()
    const tags = [
      safeString(task.priority).trim(),
      ...safeStringArray(task.ingredient_ids).slice(0, 3),
    ].filter(Boolean)

    return {
      id,
      to: '',
      imageUrl: '',
      title: name,
      subtitle: joinSubtitle(category, safeString(task.service_date).trim()),
      badges: tags.slice(0, 4),
      name,
      description: safeString(task.description).trim(),
      category,
      unit,
      status,
      tags,
    }
  }

  function card(target?: KitchenMiseTask | null | undefined): MiseEnPlaceCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: KitchenMiseTask | null | undefined): MiseEnPlacePill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: KitchenMiseTask | null | undefined): MiseEnPlaceCell | null {
    const base = card(target)
    if (!base) return null
    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      status: base.status,
      category: base.category,
      unit: base.unit,
      prop: base.description,
    }
  }

  function preview(target?: KitchenMiseTask | null | undefined): MiseEnPlacePreview | null {
    const base = card(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      status: base.status,
      prop: base.description,
      badges: base.badges,
      details: [
        { label: 'Station', value: base.category || '—' },
        { label: 'ETA', value: base.unit || '—' },
      ],
    }
  }

  function profile(target?: KitchenMiseTask | null | undefined): MiseEnPlaceProfile | null {
    const base = card(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      prop: base.description,
      category: base.category,
      unit: base.unit,
      status: base.status,
      tags: base.tags,
    }
  }

  function searchText(task: KitchenMiseTask): string {
    const mapped = map(task)
    return [
      mapped.name,
      mapped.category,
      mapped.unit,
      mapped.status,
      mapped.tags.join(' '),
      safeString(task.menu_id).trim(),
      safeString(task.recipe_id).trim(),
      safeStringArray(task.ingredient_ids).join(' '),
      mapped.id,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
