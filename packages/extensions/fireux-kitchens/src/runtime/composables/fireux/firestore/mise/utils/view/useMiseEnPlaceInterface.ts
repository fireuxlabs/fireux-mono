import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { KitchenIngredientResolved } from '../../../../../../../models/ingredient.model'

const joinSubtitle = (category: string, unit: string): string =>
  [safeString(category).trim(), safeString(unit).trim()].filter(Boolean).join(' · ')

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

  function map(component: KitchenIngredientResolved): MiseEnPlaceCard.Card {
    const id = safeString(component.id).trim()
    const name = safeString(component.name).trim()
    const category = safeString(component.category).trim()
    const unit = safeString(component.unit).trim()
    const status = safeString(component.status).trim()
    const tags = safeStringArray(component.tags)

    return {
      id,
      to: '',
      imageUrl: safeString(component.image_url).trim(),
      title: name,
      subtitle: joinSubtitle(category, unit),
      badges: tags.slice(0, 4),
      name,
      description: safeString(component.description).trim(),
      category,
      unit,
      status,
      tags,
    }
  }

  function card(target?: KitchenIngredientResolved | null | undefined): MiseEnPlaceCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: KitchenIngredientResolved | null | undefined): MiseEnPlacePill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: KitchenIngredientResolved | null | undefined): MiseEnPlaceCell | null {
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

  function preview(target?: KitchenIngredientResolved | null | undefined): MiseEnPlacePreview | null {
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
        { label: 'Category', value: base.category || '—' },
        { label: 'Unit', value: base.unit || '—' },
      ],
    }
  }

  function profile(target?: KitchenIngredientResolved | null | undefined): MiseEnPlaceProfile | null {
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

  function searchText(component: KitchenIngredientResolved): string {
    const mapped = map(component)
    return [
      mapped.name,
      mapped.category,
      mapped.unit,
      mapped.status,
      mapped.tags.join(' '),
      mapped.id,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
