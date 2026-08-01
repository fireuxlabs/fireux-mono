import { FieldValue } from 'firebase-admin/firestore'
import {
  TranslationMemoryStorage,
  type TranslationMemoryProvenanceKind,
  type TranslationMemoryRecorder,
  type TranslationMemoryRecord,
} from '../../models/translation.model'
import type { SproochliHostStorage } from './storage'
import {
  matchesSproochliStorageMetadata,
  sproochliStorageMetadata,
} from './storage'
import { makeSproochliMenuMemoryKey } from './key'

export type SproochliTranslationMemoryCandidate = {
  cacheVersion: string
  domain: string
  fieldKind: string
  fieldId: string
  sourceLanguage: string
  sourceText: string
  sourceHash: string
  targetLanguage: string
  glossaryVersion: string
}

export type SproochliTranslationMemoryValue =
  SproochliTranslationMemoryCandidate & {
    provider: string
    translatedText: string
    provenance?: {
      kind: TranslationMemoryProvenanceKind
      generatedBy: TranslationMemoryRecorder
      provider?: string
      sourceAppId?: string
      sourceDocumentId?: string
      sourceModel?: string
    }
  }

export type SproochliTranslationMemoryHit = {
  provider: string
  text: string
}

const READ_BATCH_SIZE = 100
const WRITE_BATCH_SIZE = 400
const text = (value: unknown) => String(value ?? '').trim()
const language = (value: unknown) =>
  text(value).replace(/_/g, '-').toLowerCase()

const chunks = <T>(values: T[], size: number) => {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size))
  }
  return result
}

export function sproochliTranslationMemoryId(
  candidate: SproochliTranslationMemoryCandidate
) {
  return makeSproochliMenuMemoryKey({
    cacheVersion: candidate.cacheVersion,
    domain: candidate.domain,
    fieldKind: candidate.fieldKind,
    sourceHash: candidate.sourceHash,
    sourceLanguage: candidate.sourceLanguage,
    targetLanguage: candidate.targetLanguage,
    glossaryVersion: candidate.glossaryVersion,
  })
}

function normalizeCandidate(
  candidate: SproochliTranslationMemoryCandidate
): SproochliTranslationMemoryCandidate {
  return {
    cacheVersion: text(candidate.cacheVersion),
    domain: text(candidate.domain),
    fieldKind: text(candidate.fieldKind),
    fieldId: text(candidate.fieldId),
    sourceLanguage: language(candidate.sourceLanguage),
    sourceText: text(candidate.sourceText),
    sourceHash: text(candidate.sourceHash).toLowerCase(),
    targetLanguage: language(candidate.targetLanguage),
    glossaryVersion: text(candidate.glossaryVersion),
  }
}

function usableMemoryRecord(
  storage: SproochliHostStorage,
  candidate: SproochliTranslationMemoryCandidate,
  value: (Partial<TranslationMemoryRecord> & {
    storage?: unknown
  }) | undefined
): SproochliTranslationMemoryHit | null {
  const normalized = normalizeCandidate(candidate)
  const translatedText = text(value?.translated_text)
  const provider = text(value?.provider)

  if (
    !matchesSproochliStorageMetadata(value?.storage, storage.target) ||
    !translatedText ||
    !provider ||
    value?.review_status !== 'unreviewed' ||
    text(value.cache_version) !== normalized.cacheVersion ||
    text(value.domain) !== normalized.domain ||
    text(value.field_kind) !== normalized.fieldKind ||
    language(value.source_language) !== normalized.sourceLanguage ||
    text(value.source_text) !== normalized.sourceText ||
    text(value.source_hash).toLowerCase() !== normalized.sourceHash ||
    language(value.target_language) !== normalized.targetLanguage ||
    text(value.glossary_version) !== normalized.glossaryVersion
  ) {
    return null
  }

  return { provider, text: translatedText }
}

export async function readSproochliTranslationMemory(
  storage: SproochliHostStorage,
  candidates: SproochliTranslationMemoryCandidate[]
) {
  const normalizedById = new Map(
    candidates
      .map(normalizeCandidate)
      .map(candidate =>
        [sproochliTranslationMemoryId(candidate), candidate] as const
      )
      .filter(([id]) => id)
  )
  const hits = new Map<string, SproochliTranslationMemoryHit>()
  if (!normalizedById.size) return hits

  const entries = [...normalizedById.entries()]
  for (const group of chunks(entries, READ_BATCH_SIZE)) {
    const snapshots = await storage.db.getAll(
      ...group.map(([id]) =>
        storage.db.collection(TranslationMemoryStorage.collection).doc(id)
      )
    )

    snapshots.forEach((snapshot, index) => {
      if (!snapshot.exists) return
      const [id, candidate] = group[index]!
      const hit = usableMemoryRecord(
        storage,
        candidate,
        snapshot.data() as Partial<TranslationMemoryRecord>
      )
      if (hit) hits.set(id, hit)
    })
  }

  return hits
}

function provenanceKind(provider: string): TranslationMemoryProvenanceKind {
  return provider.startsWith('fireux-ai') ? 'ai' : 'machine_translation'
}

export async function writeSproochliTranslationMemory(
  storage: SproochliHostStorage,
  values: SproochliTranslationMemoryValue[]
) {
  const normalizedById = new Map(
    values
      .map(value => ({
        ...normalizeCandidate(value),
        provider: text(value.provider),
        translatedText: text(value.translatedText),
        provenance: value.provenance,
      }))
      .map(value => [sproochliTranslationMemoryId(value), value] as const)
      .filter((entry): entry is [string, typeof entry[1]] =>
        Boolean(entry[0] && entry[1].provider && entry[1].translatedText)
      )
  )
  if (!normalizedById.size) return 0

  let writes = 0
  for (const group of chunks([...normalizedById.entries()], WRITE_BATCH_SIZE)) {
    writes += await storage.db.runTransaction(async transaction => {
      const refs = group.map(([id]) =>
        storage.db.collection(TranslationMemoryStorage.collection).doc(id)
      )
      const snapshots = await transaction.getAll(...refs)
      let groupWrites = 0

      snapshots.forEach((snapshot, index) => {
        if (snapshot.exists) return
        const [id, value] = group[index]!
        const provenance = value.provenance
        transaction.create(snapshot.ref, {
          id,
          cache_version: value.cacheVersion,
          domain: value.domain,
          field_kind: value.fieldKind,
          field_id: value.fieldId,
          source_language: value.sourceLanguage,
          source_text: value.sourceText,
          source_hash: value.sourceHash,
          target_language: value.targetLanguage,
          translated_text: value.translatedText,
          glossary_version: value.glossaryVersion,
          provider: value.provider,
          review_status: 'unreviewed',
          storage: sproochliStorageMetadata(storage.target),
          provenance: {
            kind: provenance?.kind || provenanceKind(value.provider),
            provider: text(provenance?.provider) || value.provider,
            generated_by:
              provenance?.generatedBy || 'sproochli-menu-translate',
            ...(text(provenance?.sourceAppId)
              ? { source_app_id: text(provenance?.sourceAppId) }
              : {}),
            ...(text(provenance?.sourceDocumentId)
              ? { source_document_id: text(provenance?.sourceDocumentId) }
              : {}),
            ...(text(provenance?.sourceModel)
              ? { source_model: text(provenance?.sourceModel) }
              : {}),
            generated_at: FieldValue.serverTimestamp(),
          },
          updated_at: FieldValue.serverTimestamp(),
        })
        groupWrites += 1
      })

      return groupWrites
    })
  }

  return writes
}
