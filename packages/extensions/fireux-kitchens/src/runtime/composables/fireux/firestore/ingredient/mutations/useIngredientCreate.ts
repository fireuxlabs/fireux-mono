import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { FIREUX_CORE_LANGUAGE_CODES } from 'fireux-translation/runtime/languages'
import { useTranslate } from 'fireux-translation/runtime/useTranslate'
import {
  IngredientModel,
  type IngredientNameStatus,
  type IngredientCreateInput,
  type Ingredient as IngredientDoc,
} from '../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'

type IngredientCreateDraft = Partial<IngredientCreateInput> & {
  language_codes?: string[]
}

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
const normalizeLanguageCode = (value: unknown) =>
  normalizeString(value).replace(/_/g, '-')

const normalizeLanguageCodes = (values: unknown) => {
  if (!Array.isArray(values)) return []

  const seen = new Set<string>()
  const codes: string[] = []
  for (const value of values) {
    const code = normalizeLanguageCode(value)
    if (!code || seen.has(code)) continue
    seen.add(code)
    codes.push(code)
  }

  return codes
}

const normalizeNames = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const names: Record<string, string> = {}
  for (const [language, name] of Object.entries(value as Record<string, unknown>)) {
    const code = normalizeLanguageCode(language)
    const text = normalizeString(name)
    if (code && text) names[code] = text
  }

  return names
}

const normalizeNameStatuses = (
  value: unknown
): Partial<Record<string, IngredientNameStatus>> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const allowed = new Set<IngredientNameStatus>(['source', 'machine_draft', 'approved'])
  const statuses: Partial<Record<string, IngredientNameStatus>> = {}
  for (const [language, statusValue] of Object.entries(value as Record<string, unknown>)) {
    const code = normalizeLanguageCode(language)
    const status = normalizeString(statusValue) as IngredientNameStatus
    if (code && allowed.has(status)) statuses[code] = status
  }

  return statuses
}

const resolveTargetLanguages = (
  draft: IngredientCreateDraft,
  options: IngredientCreateOptions
) => {
  const configured = normalizeLanguageCodes(options.languageCodes)
  if (configured.length) return configured

  const drafted = normalizeLanguageCodes(draft.language_codes)
  if (drafted.length) return drafted

  return FIREUX_CORE_LANGUAGE_CODES
}

const buildIngredientPayload = async (
  ingredientId: string,
  draft: IngredientCreateDraft,
  options: IngredientCreateOptions,
  translate: ReturnType<typeof useTranslate>['translate']
): Promise<{ payload: IngredientDoc; failedLanguages: string[] }> => {
  const name = normalizeString(draft.name)
  const sourceLanguage =
    normalizeLanguageCode(options.sourceLanguage || draft.source_language) || 'en'
  const targetLanguages = resolveTargetLanguages(draft, options)
  const names = normalizeNames(draft.names)
  const namesStatus = normalizeNameStatuses(draft.names_status)
  const failedLanguages: string[] = []

  names[sourceLanguage] = name
  namesStatus[sourceLanguage] = 'source'

  if (options.translate !== false) {
    await Promise.all(
      targetLanguages.map(async (language) => {
        if (language === sourceLanguage || names[language]) return

        try {
          const result = await translate({
            text: name,
            from: sourceLanguage,
            to: language,
          })
          const translated = normalizeString(result.text)
          if (!translated) {
            failedLanguages.push(language)
            return
          }

          names[language] = translated
          namesStatus[language] = 'machine_draft'
        } catch {
          failedLanguages.push(language)
        }
      })
    )
  }

  const payload: IngredientDoc = {
    ...IngredientModel,
    id: ingredientId,
    name,
    source_language: sourceLanguage,
    names,
    names_status: namesStatus,
    slug: ingredientId,
    image_url: normalizeString(draft.image_url),
  }

  return { payload, failedLanguages }
}

export function useIngredientCreate() {
  const { setDocument } = useFirestoreCreate()
  const db = useFirestore()
  const { translate } = useTranslate()

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
      translate
    )

    await setDocument<IngredientDoc>(GLOBAL_COLLECTION_PATH, ingredientId, payload, {
      app: true,
      creator: true,
    })

    return { id: ingredientId, failedLanguages }
  }

  return { createIngredient }
}
