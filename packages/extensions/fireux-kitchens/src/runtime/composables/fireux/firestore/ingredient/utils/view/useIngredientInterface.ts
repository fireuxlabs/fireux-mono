import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  Ingredient,
  KitchenIngredientResolved,
} from '../../../../../../../models/ingredient.model'

const joinSubtitle = (supplierName = ''): string => safeString(supplierName).trim()

export type IngredientInterfaceItem = Ingredient | KitchenIngredientResolved

export namespace IngredientCard {
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
    supplierName: string
    allergens: string[]
    tags: string[]
  }
}

export type IngredientProfile = {
  card: IngredientCard.Card
  title: string
  subtitle: string
  prop?: string
  category: string
  unit: string
  status: string
  allergens: string[]
  tags: string[]
}

export function useIngredientInterface() {
  type IngredientPill = IngredientCard.Card

  type IngredientCell = Pick<
    IngredientCard.Card,
    | 'id'
    | 'to'
    | 'imageUrl'
    | 'name'
    | 'subtitle'
    | 'status'
    | 'category'
    | 'unit'
    | 'supplierName'
  > & {
    prop?: string
  }

  type IngredientPreview = {
    imageUrl: string
    name: string
    subtitle: string
    status: string
    prop?: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  function map(ingredient: IngredientInterfaceItem): IngredientCard.Card {
    const id = safeString(ingredient.id).trim()
    const name = safeString(ingredient.name).trim()
    const category = safeString(ingredient.category).trim()
    const unit = safeString(ingredient.unit).trim()
    const status = safeString(ingredient.status).trim()
    const supplierName = safeString((ingredient as any)?.supplier_name).trim()
    const tags = safeStringArray(ingredient.tags)

    return {
      id,
      to: id ? `/ingredients/${encodeURIComponent(id)}` : '',
      imageUrl: safeString(ingredient.image_url).trim(),
      title: name,
      subtitle: joinSubtitle(supplierName),
      badges: tags.slice(0, 4),
      name,
      description: safeString(ingredient.description).trim(),
      category,
      unit,
      status,
      supplierName,
      allergens: safeStringArray(ingredient.allergens),
      tags,
    }
  }

  function card(
    target?: IngredientInterfaceItem | null | undefined
  ): IngredientCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: IngredientInterfaceItem | null | undefined): IngredientPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: IngredientInterfaceItem | null | undefined): IngredientCell | null {
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
      supplierName: base.supplierName,
      prop: base.description,
    }
  }

  function preview(
    target?: IngredientInterfaceItem | null | undefined
  ): IngredientPreview | null {
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
        { label: 'Supplier', value: base.supplierName },
        {
          label: 'Allergens',
          value: base.allergens.length ? base.allergens.join(', ') : 'None',
        },
      ],
    }
  }

  function profile(
    target?: IngredientInterfaceItem | null | undefined
  ): IngredientProfile | null {
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
      allergens: base.allergens,
      tags: base.tags,
    }
  }

  function searchText(ingredient: IngredientInterfaceItem): string {
    const mapped = map(ingredient)
    return [
      mapped.name,
      mapped.category,
      mapped.unit,
      mapped.status,
      mapped.supplierName,
      mapped.tags.join(' '),
      mapped.id,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
