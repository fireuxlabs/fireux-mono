import type { Ingredient } from '../../../../../../../models/objects/Ingredient.model.ts'

export namespace IngredientCard {
  export interface Pill {
    id?: string
    title: string
    subtitle?: string | null
  }

  export interface Cell extends Pill {
    category?: string | null
  }

  export type Profile = Ingredient
}

export function useIngredientInterface() {
  const pillProps = (ingredient?: Ingredient | null): IngredientCard.Pill => ({
    id: ingredient?.id,
    title: ingredient?.name || 'Ingredient',
    subtitle: ingredient?.supplierInfo?.business_name ?? ingredient?.category ?? null,
  })

  const cellProps = (ingredient?: Ingredient | null): IngredientCard.Cell => {
    const pill = pillProps(ingredient)
    return {
      ...pill,
      category: ingredient?.category ?? null,
    }
  }

  return { pillProps, cellProps }
}
