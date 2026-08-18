import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { SupplierIngredient } from '../../../../models/Supplier.model.ts'

export type SupplierIngredientInterfaceItem = Partial<SupplierIngredient> & {
  id: string
  ingredient_id: string
  label?: string
  image_url?: string
  category?: string
  root_status?: string
  missing_root_ingredient?: boolean
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
    imageUrl: string
    status: string
    warning: string
  }
}

export function useSupplierIngredientInterface() {
  function map(item: SupplierIngredientInterfaceItem): SupplierIngredientItemCard.Card {
    const ingredientId = safeString(item.ingredient_id || item.id).trim()
    const title = safeString(item.label).trim()
    const path = safeString(item.path).trim()

    return {
      id: safeString(item.id || ingredientId).trim(),
      to: '',
      title,
      subtitle: ingredientId,
      ingredientId,
      path,
      imageUrl: safeString(item.image_url).trim(),
      status: safeString(item.root_status || item.status).trim(),
      warning: item.missing_root_ingredient ? 'Missing root Ingredient' : '',
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
