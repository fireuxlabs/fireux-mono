import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Dish } from '../../../../../../../models/dish.model'

const joinSubtitle = (active: boolean): string =>
  active ? 'Active' : 'Inactive'

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
    meta: string
    status: string
    badges: string[]
    summary: string
    name: string
    description: string
    active: boolean
    recipeIds: string[]
    ingredientIds: string[]
    miseIds: string[]
  }
}

export type DishProfile = {
  card: DishCard.Card
  title: string
  subtitle: string
  description: string
  active: boolean
}

export function useDishInterface() {
  type DishPill = DishCard.Card

  type DishCell = Pick<
    DishCard.Card,
    'id' | 'to' | 'imageUrl' | 'title' | 'subtitle' | 'meta' | 'description' | 'active'
  >

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
    const shortName = safeString((dish as any).short_name).trim()
    const displayName = shortName || name
    const active = Boolean(dish.active)
    const ingredientIds = safeStringArray(dish.ingredient_ids)
    const miseIds = safeStringArray(dish.mise_ids)

    return {
      id,
      to: id ? `/console/kitchen/dishes?dish=${encodeURIComponent(id)}` : '/console/kitchen/dishes',
      imageUrl: safeString(dish.image_url).trim(),
      title: displayName,
      subtitle: joinSubtitle(active),
      meta: 'Dish',
      status: active ? 'active' : 'inactive',
      badges: [active ? 'active' : 'inactive'],
      summary: safeString(dish.description).trim(),
      name: displayName,
      description: safeString(dish.description).trim(),
      active,
      recipeIds,
      ingredientIds,
      miseIds,
    }
  }

  function buildInterface(target?: Dish | null | undefined): DishCard.Card | null {
    if (!target) return null
    return map(target)
  }

  function pill(target?: Dish | null | undefined): DishPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: Dish | null | undefined): DishCell | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      title: base.title,
      subtitle: base.subtitle,
      meta: base.meta,
      description: base.description,
      active: base.active,
    }
  }

  function preview(target?: Dish | null | undefined): DishPreview | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      ingredientPills: base.ingredientIds.map((id) => ({
        id,
        to: id ? `/console/kitchen/ingredients?ingredient=${encodeURIComponent(id)}` : '/console/kitchen/ingredients',
        title: toPillTitle(id),
        imageUrl: '',
      })),
      misePills: base.miseIds.map((id) => ({
        id,
        to: id ? `/console/kitchen/mise?mise=${encodeURIComponent(id)}` : '/console/kitchen/mise',
        title: toPillTitle(id),
        imageUrl: '',
      })),
    }
  }

  function profile(target?: Dish | null | undefined): DishProfile | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      description: base.description,
      active: base.active,
    }
  }

  return { pill, cell, preview, profile }
}
