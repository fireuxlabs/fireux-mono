import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ingredient } from '../utils/ingredient.ts'
import {
  ingredientCategoryLabel,
  ingredientKindLabel,
} from '../models/ingredient-taxonomy'
import type { KitchenIngredient } from '../../kitchen/utils/ingredient.ts'

const formatPackPrice = (costMinor?: number | null, currencyCode?: string) => {
  const amount = Number(costMinor)
  if (!Number.isFinite(amount) || amount <= 0) return ''

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: safeString(currencyCode).trim().toUpperCase() || 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

const joinSubtitle = (...parts: unknown[]): string =>
  parts
    .map((part) => safeString(part).trim())
    .filter(Boolean)
    .join(' · ')

export type IngredientInterfaceItem = Partial<Ingredient> & {
  id: string
  ingredient_id?: string
  kitchen_ingredient?: KitchenIngredient
  missing_root_ingredient?: boolean
  supplier_currency_code?: string
  supplier_id?: string
  supplier_item_id?: string
  supplier_name?: string
  supplier_pack_cost_minor?: number | null
  supplier_pack_label?: string
  production_usage_label?: string
  production_usage_menu_names?: string[]
  production_usage_sources?: string[]
}

export namespace IngredientCard {
  export type Card = {
    id: string
    slug: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    meta: string
    badges: string[]
    summary: string
    name: string
    status: string
    supplierName: string
    categoryLabel: string
    kindLabel: string
    aliases: string[]
    parentIngredientId: string
  }
}

export type IngredientProfile = {
  card: IngredientCard.Card
  title: string
  subtitle: string
  status: string
  details: Array<{ label: string; value: string }>
}

export function useIngredientInterface() {
  type IngredientPill = IngredientCard.Card

  type IngredientCell = Pick<
    IngredientCard.Card,
    'id' | 'to' | 'imageUrl' | 'name' | 'subtitle' | 'status' | 'supplierName'
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
    const status = safeString(
      (ingredient as any)?.status || ingredient.production_usage_label
    ).trim()
    const supplierName = safeString((ingredient as any)?.supplier_name).trim()
    const supplierId = safeString((ingredient as any)?.supplier_id).trim()
    const supplierRef = supplierName || supplierId
    const supplierPackLabel = safeString(ingredient.supplier_pack_label).trim()
    const supplierPackPrice = formatPackPrice(
      ingredient.supplier_pack_cost_minor,
      ingredient.supplier_currency_code
    )
    const supplierSummary = joinSubtitle(
      supplierRef,
      supplierPackLabel,
      supplierPackPrice
    )
    const categoryLabel = ingredientCategoryLabel(ingredient.category)
    const kindLabel = ingredientKindLabel(ingredient.kind)
    const aliases = Array.isArray(ingredient.aliases)
      ? ingredient.aliases
          .map(safeString)
          .map((value) => value.trim())
          .filter(Boolean)
      : []
    const parentIngredientId = safeString(
      ingredient.parent_ingredient_id
    ).trim()
    const taxonomySummary = joinSubtitle(categoryLabel, kindLabel)

    return {
      id,
      slug,
      to: '',
      imageUrl: safeString(ingredient.image_url).trim(),
      title: name,
      subtitle: supplierSummary || taxonomySummary,
      meta: supplierSummary || taxonomySummary,
      badges: status ? [status] : [],
      summary: '',
      name,
      status,
      supplierName: supplierRef,
      categoryLabel,
      kindLabel,
      aliases,
      parentIngredientId,
    }
  }

  function buildInterface(
    target?: IngredientInterfaceItem | null | undefined
  ): IngredientCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: IngredientInterfaceItem | null | undefined
  ): IngredientPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(
    target?: IngredientInterfaceItem | null | undefined
  ): IngredientCell | null {
    const base = buildInterface(target)
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
    const base = buildInterface(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      status: base.status,
      details: [{ label: 'Supplier', value: base.supplierName }],
    }
  }

  function profile(
    target?: IngredientInterfaceItem | null | undefined
  ): IngredientProfile | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      status: base.status,
      details: [
        { label: 'Category', value: base.categoryLabel },
        { label: 'Kind', value: base.kindLabel },
        ...(base.aliases.length
          ? [{ label: 'Aliases', value: base.aliases.join(', ') }]
          : []),
        ...(base.parentIngredientId
          ? [{ label: 'Parent', value: base.parentIngredientId }]
          : []),
      ],
    }
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
