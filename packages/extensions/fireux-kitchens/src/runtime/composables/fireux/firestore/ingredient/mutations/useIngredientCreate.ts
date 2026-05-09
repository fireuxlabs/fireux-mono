import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import {
  IngredientModel,
  type IngredientCreateInput,
  type Ingredient as IngredientDoc,
} from '../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'

type IngredientCreateDraft = Partial<IngredientCreateInput>

type IngredientCreateOptions = {
  languageCodes?: string[]
  sourceLanguage?: string
  translate?: boolean
}

export type IngredientCreateResult = {
  id: string
  failedLanguages: string[]
}

const resolveIngredientId = (name: string) => {
  const base = normalizeSlug(name)
  return base || ''
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

const buildIngredientPayload = async (
  ingredientId: string,
  draft: IngredientCreateDraft,
  options: IngredientCreateOptions,
  seedTranslations: ReturnType<typeof useTranslationSeed>['seedTranslations']
): Promise<{ payload: IngredientDoc; failedLanguages: string[] }> => {
  const name = normalizeString(draft.name)
  const seeded = await seedTranslations({
    text: name,
    sourceLanguage: options.sourceLanguage,
    languageCodes: options.languageCodes,
    existingText: draft.names,
    existingStatus: draft.names_status,
    translate: options.translate,
  })

  const payload: IngredientDoc = {
    ...IngredientModel,
    id: ingredientId,
    name,
    source_language: seeded.sourceLanguage,
    names: seeded.text,
    names_status: seeded.status,
    slug: ingredientId,
    image_url: normalizeString(draft.image_url),
  }

  return { payload, failedLanguages: seeded.failedLanguages }
}

export function useIngredientCreate() {
  const { setDocument } = useFirestoreCreate()
  const db = useFirestore()
  const { seedTranslations } = useTranslationSeed()

  const createIngredient = async (
    draft: IngredientCreateDraft,
    options: IngredientCreateOptions = {}
  ): Promise<IngredientCreateResult> => {
    const name = normalizeString(draft.name)
    if (!name) throw new Error('Ingredient name is required')

    const ingredientId = resolveIngredientId(name)
    if (!ingredientId) throw new Error('Unable to resolve ingredient id')

    const ingredientRef = doc(db, GLOBAL_COLLECTION_PATH, ingredientId)
    const ingredientSnap = await getDoc(ingredientRef)
    if (ingredientSnap.exists()) {
      throw new Error('Ingredient already exists')
    }

    const { payload, failedLanguages } = await buildIngredientPayload(
      ingredientId,
      draft,
      options,
      seedTranslations
    )

    await setDocument<IngredientDoc>(GLOBAL_COLLECTION_PATH, ingredientId, payload, {
      app: true,
      creator: true,
    })

    return { id: ingredientId, failedLanguages }
  }

  return { createIngredient }
}
