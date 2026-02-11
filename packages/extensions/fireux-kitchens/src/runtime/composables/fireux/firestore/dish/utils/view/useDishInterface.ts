import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { KitchenDish } from '../../../../../../models/kitchen-dish.model'

const joinSubtitle = (station: string, course: string): string =>
  [safeString(station).trim(), safeString(course).trim()].filter(Boolean).join(' · ')

export namespace DishCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    badges: string[]
    name: string
    description: string
    station: string
    course: string
    status: string
    tags: string[]
    recipeId: string
  }
}

export type DishProfile = {
  card: DishCard.Card
  title: string
  subtitle: string
  prop?: string
  station: string
  course: string
  status: string
  tags: string[]
}

export function useDishInterface() {
  type DishPill = DishCard.Card

  type DishCell = Pick<
    DishCard.Card,
    'id' | 'to' | 'imageUrl' | 'name' | 'subtitle' | 'status' | 'station' | 'course'
  > & {
    prop?: string
  }

  type DishPreview = {
    imageUrl: string
    name: string
    subtitle: string
    status: string
    prop?: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  function map(dish: KitchenDish): DishCard.Card {
    const id =
      safeString(dish.id).trim() ||
      safeString(dish.name).trim() ||
      safeString(dish.recipe_id).trim()
    const name = safeString(dish.name).trim()
    const station = safeString(dish.station).trim()
    const course = safeString(dish.course).trim()
    const status = safeString(dish.status).trim()
    const tags = safeStringArray(dish.tags)

    return {
      id,
      to: '',
      imageUrl: safeString(dish.image_url).trim(),
      title: name,
      subtitle: joinSubtitle(station, course),
      badges: tags.slice(0, 4),
      name,
      description: safeString(dish.description).trim(),
      station,
      course,
      status,
      tags,
      recipeId: safeString(dish.recipe_id).trim(),
    }
  }

  function card(target?: KitchenDish | null | undefined): DishCard.Card | null {
    if (!target) return null
    return map(target)
  }

  function pill(target?: KitchenDish | null | undefined): DishPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: KitchenDish | null | undefined): DishCell | null {
    const base = card(target)
    if (!base) return null
    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      status: base.status,
      station: base.station,
      course: base.course,
      prop: base.description,
    }
  }

  function preview(target?: KitchenDish | null | undefined): DishPreview | null {
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
        { label: 'Station', value: base.station || '—' },
        { label: 'Course', value: base.course || '—' },
        { label: 'Recipe', value: base.recipeId || '—' },
      ],
    }
  }

  function profile(target?: KitchenDish | null | undefined): DishProfile | null {
    const base = card(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      prop: base.description,
      station: base.station,
      course: base.course,
      status: base.status,
      tags: base.tags,
    }
  }

  function searchText(dish: KitchenDish): string {
    const mapped = map(dish)
    return [
      mapped.name,
      mapped.station,
      mapped.course,
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
