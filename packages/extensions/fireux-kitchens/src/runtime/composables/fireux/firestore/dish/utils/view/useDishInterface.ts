import {
  safeString,
  safeStringArray,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Dish } from '../../../../../../models/dish.model'

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
    recipeIds: string[]
    ingredientIds: string[]
  }
}

export type DishProfile = {
  card: DishCard.Card
  title: string
  subtitle: string
  description: string
}

export function useDishInterface() {
  type DishPill = DishCard.Card

  type DishCell = Pick<
    DishCard.Card,
    | 'id'
    | 'to'
    | 'imageUrl'
    | 'title'
    | 'subtitle'
    | 'meta'
    | 'description'
  >

  type DishPreview = {
    recipeIds: string[]
    ingredientIds: string[]
  }

  function map(dish: Dish): DishCard.Card {
    const id = safeString(dish.id).trim()
    const name = safeString(dish.name).trim()
    const description = safeString(dish.description).trim()
    const recipeIds = safeStringArray(dish.recipe_ids)
    const ingredientIds = safeStringArray(dish.ingredient_ids)

    return {
      id,
      to: `/console/kitchen/dishes/${encodeURIComponent(id)}`,
      imageUrl: '',
      title: name,
      subtitle: description,
      meta: 'Dish',
      status: '',
      badges: [],
      summary: description,
      name,
      description,
      recipeIds,
      ingredientIds,
    }
  }

  function buildInterface(
    target?: Dish | null | undefined
  ): DishCard.Card | null {
    if (!target) return null
    return map(target)
  }

  const toInterface = buildInterface

  function pill(target?: Dish | null | undefined): DishPill | null {
    return buildInterface(target)
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
    }
  }

  function preview(target?: Dish | null | undefined): DishPreview | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      recipeIds: base.recipeIds,
      ingredientIds: base.ingredientIds,
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
    }
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
