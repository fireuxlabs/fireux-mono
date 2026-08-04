import {
  normalizeSproochliLanguage,
} from 'fireux-sproochli/runtime/sproochli'
import type {
  SproochliMenuCacheImportUnit,
} from 'fireux-sproochli/runtime/menu-cache'
import {
  resolveSproochliHostStorage,
} from 'fireux-sproochli/runtime/server/menu/storage'
import {
  sproochliMenuTranslationMemoryCandidate,
} from 'fireux-sproochli/runtime/server/menu/translation-recipe'
import {
  sproochliTranslationMemoryId,
  writeSproochliTranslationMemory,
  type SproochliTranslationMemoryValue,
} from 'fireux-sproochli/runtime/server/menu/translation-memory'
import type { KitchenMenuDraftTranslation } from '../draft/sections'

const text = (value: unknown) => String(value ?? '').trim()

export function appendKitchenMenuCacheUnits(
  units: SproochliMenuCacheImportUnit[],
  input: {
    fieldId: string
    sourceText: string
    translations?: KitchenMenuDraftTranslation[]
  }
) {
  const sourceText = text(input.sourceText)
  if (!sourceText) return

  input.translations?.forEach((translation) => {
    const translatedText = text(translation.text)
    if (!translation.language || !translatedText) return
    units.push({
      fieldId: input.fieldId,
      sourceText,
      targetLanguage: translation.language,
      translatedText,
    })
  })
}

export type KitchenMenuCacheImportOutcome =
  | { status: 'empty'; units: number; writes: number; existing: number }
  | { status: 'imported'; units: number; writes: number; existing: number }

export async function importKitchenMenuCacheUnits(input: {
  appId: string
  uploadId: string
  provider: string
  model?: string
  units: SproochliMenuCacheImportUnit[]
}): Promise<KitchenMenuCacheImportOutcome> {
  if (!input.units.length) {
    return { status: 'empty', units: 0, writes: 0, existing: 0 }
  }

  const storage = resolveSproochliHostStorage()
  if (text(input.appId) !== storage.target.appId) {
    throw new Error('Sproochli Menu cache import host does not match runtime.')
  }

  const valuesByIdentity =
    new Map<string, SproochliTranslationMemoryValue>()
  input.units.forEach((unit, index) => {
    const fieldId = text(unit.fieldId)
    const sourceText = text(unit.sourceText)
    const translatedText = text(unit.translatedText)
    const targetLanguage = normalizeSproochliLanguage(unit.targetLanguage)
    if (!fieldId || !sourceText || !translatedText || !targetLanguage) {
      throw new Error(`Sproochli Menu cache import unit ${index + 1} is invalid.`)
    }

    const candidate = sproochliMenuTranslationMemoryCandidate({
      fieldId,
      sourceLanguage: 'auto',
      sourceText,
      targetLanguage,
    })
    const identity = sproochliTranslationMemoryId(candidate)
    if (!identity) {
      throw new Error(`Sproochli Menu cache import unit ${index + 1} is invalid.`)
    }

    const value: SproochliTranslationMemoryValue = {
      ...candidate,
      provider: 'source-document-extraction',
      translatedText,
      provenance: {
        kind: 'source_document_extraction',
        generatedBy: 'sproochli-menu-cache-import',
        provider: text(input.provider) || 'fireux-ai-menu-extraction',
        sourceAppId: storage.target.appId,
        sourceDocumentId: text(input.uploadId),
        ...(text(input.model) ? { sourceModel: text(input.model) } : {}),
      },
    }
    const existing = valuesByIdentity.get(identity)
    if (existing && existing.translatedText !== translatedText) {
      throw new Error(
        `Sproochli Menu cache import unit ${index + 1} conflicts with aligned copy.`
      )
    }
    valuesByIdentity.set(identity, value)
  })

  const values = [...valuesByIdentity.values()]
  const writes = await writeSproochliTranslationMemory(storage, values)
  return {
    status: 'imported',
    units: input.units.length,
    writes,
    existing: values.length - writes,
  }
}
