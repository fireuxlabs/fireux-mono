import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Dish } from '../../../../../../models/dish.model'

const joinSubtitle = (station: string, course: string): string =>
  [safeString(station).trim(), safeString(course).trim()].filter(Boolean).join(' · ')

const DUMMY_PILL_LABELS: Record<string, string> = {
  'beef-patty-piece': 'Beef Patty',
  'bun-brioche-piece': 'Brioche Bun',
  'prep-lettuce-leaves-piece': 'Lettuce Leaves',
  'prep-tomato-slice-piece': 'Tomato Slice',
}

const toPillTitle = (id: string): string =>
  DUMMY_PILL_LABELS[String(id || '').trim()] ||
  String(id || '')
    .trim()
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

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
    recipeIds: string[]
    ingredientIds: string[]
    miseIds: string[]
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
    ingredientPills: Array<{ id: string; to: string; title: string; imageUrl: string }>
    misePills: Array<{ id: string; to: string; title: string; imageUrl: string }>
  }

  function map(dish: Dish): DishCard.Card {
    const recipeIds = safeStringArray(dish.recipe_ids)
    const id =
      safeString(dish.id).trim() ||
      safeString(dish.name).trim() ||
      recipeIds[0] ||
      ''
    const name = safeString(dish.name).trim()
    const station = safeString(dish.station).trim()
    const course = safeString(dish.course).trim()
    const status = safeString(dish.status).trim()
    const tags = safeStringArray(dish.tags)
    const ingredientIds = safeStringArray(dish.ingredient_ids)
    const miseIds = safeStringArray(dish.mise_ids)

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
      recipeIds,
      ingredientIds,
      miseIds,
    }
  }

  function card(target?: Dish | null | undefined): DishCard.Card | null {
    if (!target) return null
    return map(target)
  }

  function pill(target?: Dish | null | undefined): DishPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: Dish | null | undefined): DishCell | null {
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

  function preview(target?: Dish | null | undefined): DishPreview | null {
    const base = card(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      ingredientPills: base.ingredientIds.map((id) => ({
        id,
        to: '',
        title: toPillTitle(id),
        imageUrl: '',
      })),
      misePills: base.miseIds.map((id) => ({
        id,
        to: '',
        title: toPillTitle(id),
        imageUrl: '',
      })),
    }
  }

  function profile(target?: Dish | null | undefined): DishProfile | null {
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

  function searchText(dish: Dish): string {
    const mapped = map(dish)
    return [
      mapped.name,
      mapped.station,
      mapped.course,
      mapped.status,
      mapped.tags.join(' '),
      mapped.recipeIds.join(' '),
      mapped.ingredientIds.join(' '),
      mapped.miseIds.join(' '),
      mapped.id,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
