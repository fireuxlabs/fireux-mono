import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { SupplierIngredient } from '../../../../../../models/supplier/Supplier.model'

export type SupplierIngredientInterfaceItem = Partial<SupplierIngredient> & {
  id: string
  ingredient_id: string
  label?: string
  path?: string
}

export namespace SupplierIngredientItemCard {
  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    ingredientId: string
    path: string
  }
}

const titleFromId = (value: string) =>
  value
    .split('-')
    .map((part) => part ? `${part[0]?.toUpperCase()}${part.slice(1)}` : '')
    .join(' ')

export function useSupplierIngredientInterface() {
  function map(item: SupplierIngredientInterfaceItem): SupplierIngredientItemCard.Card {
    const ingredientId = safeString(item.ingredient_id || item.id).trim()
    const title = safeString(item.label).trim() || titleFromId(ingredientId)
    const path = safeString(item.path).trim()

    return {
      id: safeString(item.id || ingredientId).trim(),
      to: '',
      title,
      subtitle: ingredientId,
      ingredientId,
      path,
    }
  }

  function buildInterface(
    target?: SupplierIngredientInterfaceItem | null | undefined
  ): SupplierIngredientItemCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  return {
    interface: buildInterface,
    pill: buildInterface,
    cell: buildInterface,
  }
}
