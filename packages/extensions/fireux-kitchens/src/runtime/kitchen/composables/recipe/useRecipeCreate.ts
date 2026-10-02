import type { RecipePreparation } from '../../models/recipe-preparation'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import { useRecipeMutation } from './useRecipeMutation'

type RecipeCreateDraft = {
  name: string
  description?: string
  preparation?: RecipePreparation
  names?: unknown
  descriptions?: unknown
}

type RecipeCreateOptions = {
  languageCodes?: string[]
  sourceLanguage?: string
  translate?: boolean
}

export type RecipeCreateResult = {
  id: string
  failedLanguages: string[]
}

export function useRecipeCreate() {
  const { seedTranslations } = useTranslationSeed()
  const { mutate } = useRecipeMutation()
  const createRecipe = async (
    draft: RecipeCreateDraft,
    overrides: { kitchenId?: string } = {},
    createOptions: RecipeCreateOptions = {}
  ): Promise<RecipeCreateResult> => {
    const options = JSON.parse(JSON.stringify(createOptions)) as RecipeCreateOptions
    let failedLanguages: string[] = []
    const result = await mutate('POST', { draft }, overrides.kitchenId, async body => {
      const captured = body.draft as RecipeCreateDraft
      const name = String(captured.name ?? '').trim()
      const description = String(captured.description ?? '').trim()
      const nameSeed = await seedTranslations({ text: name, sourceLanguage: options.sourceLanguage, languageCodes: options.languageCodes, existingText: captured.names, translate: options.translate })
      const descriptionSeed = description ? await seedTranslations({ text: description, sourceLanguage: nameSeed.sourceLanguage, languageCodes: options.languageCodes, existingText: captured.descriptions, translate: options.translate }) : null
      failedLanguages = [...new Set([...nameSeed.failedLanguages, ...(descriptionSeed?.failedLanguages ?? [])])]
      return { ...body, draft: { ...captured, name, description, source_language: nameSeed.sourceLanguage, names: nameSeed.text, descriptions: descriptionSeed?.text ?? {} } }
    })
    return { id: result.id, failedLanguages }
  }
  return { createRecipe }
}
