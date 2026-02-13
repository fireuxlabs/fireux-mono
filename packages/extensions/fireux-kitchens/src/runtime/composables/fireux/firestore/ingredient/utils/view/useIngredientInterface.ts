import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  Ingredient,
  KitchenIngredientResolved,
} from '../../../../../../models/ingredient.model'

const joinSubtitle = (supplierRef = ''): string => safeString(supplierRef).trim()

export type IngredientInterfaceItem = Ingredient | KitchenIngredientResolved

export namespace IngredientCard {
  export type Card = {
    id: string
    slug: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    name: string
    status: string
    supplierName: string
  }
}

export type IngredientProfile = {
  card: IngredientCard.Card
  title: string
  subtitle: string
  status: string
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
    | 'supplierName'
  >

  type IngredientPreview = {
    imageUrl: string
    name: string
    subtitle: string
    status: string
    details: Array<{ label: string; value: string | number }>
  }

  function map(ingredient: IngredientInterfaceItem): IngredientCard.Card {
    const id = safeString(ingredient.id).trim()
    const slug = safeString((ingredient as Ingredient).slug).trim() || id
    const name = safeString(ingredient.name).trim()
    const status = safeString((ingredient as any)?.status).trim()
    const supplierName = safeString((ingredient as any)?.supplier_name).trim()
    const supplierId = safeString((ingredient as any)?.supplier_id).trim()
    const supplierRef = supplierName || supplierId

    return {
      id,
      slug,
      to: id ? `/ingredients/${encodeURIComponent(id)}` : '',
      imageUrl: safeString(ingredient.image_url).trim(),
      title: name,
      subtitle: joinSubtitle(supplierRef),
      name,
      status,
      supplierName: supplierRef,
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
      supplierName: base.supplierName,
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
      details: [
        { label: 'Supplier', value: base.supplierName },
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
      status: base.status,
    }
  }

  function searchText(ingredient: IngredientInterfaceItem): string {
    const mapped = map(ingredient)
    return [
      mapped.name,
      mapped.slug,
      mapped.status,
      mapped.supplierName,
      mapped.id,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
