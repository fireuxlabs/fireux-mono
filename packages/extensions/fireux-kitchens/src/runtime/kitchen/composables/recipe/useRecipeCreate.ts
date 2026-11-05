import type { WatchSource } from 'vue'
import type { RecipePreparation } from '../../models/recipe-preparation'
import { seedSproochliText } from 'fireux-sproochli/runtime/utils/translation-seed'
import { useRecipeMutation } from './useRecipeMutation'

type RecipeCreateDraft = {
  name: string
  description?: string
  preparation?: RecipePreparation
  names?: unknown
  descriptions?: unknown
}

type RecipeCreateOptions = {
  sourceLanguage?: string
}

export type RecipeCreateResult = {
  id: string
}

export function useRecipeCreate(ownerSources: WatchSource[] = []) {
  const { mutate } = useRecipeMutation(ownerSources)
  const createRecipe = async (
    draft: RecipeCreateDraft,
    target: { kitchenId: string },
    createOptions: RecipeCreateOptions = {}
  ): Promise<RecipeCreateResult> => {
    const options = JSON.parse(
      JSON.stringify(createOptions)
    ) as RecipeCreateOptions
    const result = await mutate(
      'POST',
      { draft },
      target.kitchenId,
      async (body, assertCurrent) => {
        const captured = body.draft as RecipeCreateDraft
        const name = String(captured.name ?? '').trim()
        const description = String(captured.description ?? '').trim()
        const nameSeed = seedSproochliText({
          text: name,
          sourceLanguage: options.sourceLanguage,
          existingText: captured.names,
        })
        assertCurrent()
        const descriptionSeed = description
          ? seedSproochliText({
              text: description,
              sourceLanguage: nameSeed.sourceLanguage,
              existingText: captured.descriptions,
            })
          : null
        assertCurrent()
        return {
          ...body,
          draft: {
            ...captured,
            name,
            description,
            source_language: nameSeed.sourceLanguage,
            names: nameSeed.text,
            descriptions: descriptionSeed?.text ?? {},
          },
        }
      }
    )
    return { id: result.id }
  }
  return { createRecipe }
}
