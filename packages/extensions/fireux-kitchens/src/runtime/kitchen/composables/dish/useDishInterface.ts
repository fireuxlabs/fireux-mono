import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Dish } from '../../models/dish.model.ts'

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
  }
}

export type DishProfile = {
  card: DishCard.Card
  title: string
  subtitle: string
  description: string
}

export function useDishInterface() {
  function map(dish: Dish): DishCard.Card {
    const id = safeString(dish.id).trim()
    const name = safeString(dish.name).trim()
    const description = safeString(dish.description).trim()

    return {
      id,
      to: `/workspace/kitchen/dishes/${encodeURIComponent(id)}`,
      imageUrl: safeString(dish.image).trim(),
      title: name,
      subtitle: description,
      meta: 'Dish',
      status: '',
      badges: [],
      summary: description,
      name,
      description,
    }
  }

  function buildInterface(target?: Dish | null): DishCard.Card | null {
    return target ? map(target) : null
  }

  function cell(target?: Dish | null) {
    const base = buildInterface(target)
    if (!base) return null
    const { id, to, imageUrl, title, subtitle, meta, description } = base
    return { id, to, imageUrl, title, subtitle, meta, description }
  }

  function preview(target?: Dish | null) {
    const base = buildInterface(target)
    return base
      ? { id: base.id, title: base.title, description: base.description }
      : null
  }

  function profile(target?: Dish | null): DishProfile | null {
    const base = buildInterface(target)
    return base
      ? {
          card: base,
          title: base.title,
          subtitle: base.subtitle,
          description: base.description,
        }
      : null
  }

  return {
    interface: buildInterface,
    pill: buildInterface,
    cell,
    preview,
    profile,
  }
}
