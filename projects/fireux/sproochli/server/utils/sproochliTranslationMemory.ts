import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  TranslationMemoryStorage,
  type TranslationMemoryProvenanceKind,
  type TranslationMemoryRecord,
} from 'fireux-sproochli/runtime/models/translation.model.ts'
import {
  normalizeSproochliLanguageCode,
  normalizeSproochliText,
} from './sproochliTranslate'
import { makeSproochliMenuCacheKey } from './sproochliTranslationKey'

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
  }

export type SproochliTranslationMemoryHit = {
  provider: string
  text: string
}

const READ_BATCH_SIZE = 100
const WRITE_BATCH_SIZE = 400

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
  return makeSproochliMenuCacheKey({
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
    cacheVersion: normalizeSproochliText(candidate.cacheVersion),
    domain: normalizeSproochliText(candidate.domain),
    fieldKind: normalizeSproochliText(candidate.fieldKind),
    fieldId: normalizeSproochliText(candidate.fieldId),
    sourceLanguage: normalizeSproochliLanguageCode(candidate.sourceLanguage),
    sourceText: normalizeSproochliText(candidate.sourceText),
    sourceHash: normalizeSproochliText(candidate.sourceHash).toLowerCase(),
    targetLanguage: normalizeSproochliLanguageCode(candidate.targetLanguage),
    glossaryVersion: normalizeSproochliText(candidate.glossaryVersion),
  }
}

function usableMemoryRecord(
  candidate: SproochliTranslationMemoryCandidate,
  value: Partial<TranslationMemoryRecord> | undefined
): SproochliTranslationMemoryHit | null {
  const normalized = normalizeCandidate(candidate)
  const text = normalizeSproochliText(value?.translated_text)
  const provider = normalizeSproochliText(value?.provider)

  if (
    !text ||
    !provider ||
    value?.review_status !== 'unreviewed' ||
    normalizeSproochliText(value.cache_version) !== normalized.cacheVersion ||
    normalizeSproochliText(value.domain) !== normalized.domain ||
    normalizeSproochliText(value.field_kind) !== normalized.fieldKind ||
    normalizeSproochliLanguageCode(value.source_language) !== normalized.sourceLanguage ||
    normalizeSproochliText(value.source_text) !== normalized.sourceText ||
    normalizeSproochliText(value.source_hash).toLowerCase() !== normalized.sourceHash ||
    normalizeSproochliLanguageCode(value.target_language) !== normalized.targetLanguage ||
    normalizeSproochliText(value.glossary_version) !== normalized.glossaryVersion
  ) {
    return null
  }

  return { provider, text }
}

export async function readSproochliTranslationMemory(
  candidates: SproochliTranslationMemoryCandidate[]
) {
  const normalizedById = new Map(
    candidates
      .map(normalizeCandidate)
      .map(candidate => [sproochliTranslationMemoryId(candidate), candidate] as const)
      .filter(([id]) => id)
  )
  const hits = new Map<string, SproochliTranslationMemoryHit>()
  if (!normalizedById.size) return hits

  const db = getRuntimeFirestore('sproochli')
  const entries = [...normalizedById.entries()]

  for (const group of chunks(entries, READ_BATCH_SIZE)) {
    const snapshots = await db.getAll(
      ...group.map(([id]) =>
        db.collection(TranslationMemoryStorage.collection).doc(id)
      )
    )

    snapshots.forEach((snapshot, index) => {
      if (!snapshot.exists) return
      const [id, candidate] = group[index]!
      const hit = usableMemoryRecord(
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
  values: SproochliTranslationMemoryValue[]
) {
  const normalizedById = new Map(
    values
      .map(value => ({
        ...normalizeCandidate(value),
        provider: normalizeSproochliText(value.provider),
        translatedText: normalizeSproochliText(value.translatedText),
      }))
      .map(value => [sproochliTranslationMemoryId(value), value] as const)
      .filter((entry): entry is [string, typeof entry[1]] =>
        Boolean(entry[0] && entry[1].provider && entry[1].translatedText)
      )
  )
  if (!normalizedById.size) return 0

  const db = getRuntimeFirestore('sproochli')
  let writes = 0

  for (const group of chunks([...normalizedById.entries()], WRITE_BATCH_SIZE)) {
    writes += await db.runTransaction(async (transaction) => {
      const refs = group.map(([id]) =>
        db.collection(TranslationMemoryStorage.collection).doc(id)
      )
      const snapshots = await transaction.getAll(...refs)
      let groupWrites = 0

      snapshots.forEach((snapshot, index) => {
        if (snapshot.exists) return
        const [id, value] = group[index]!
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
          provenance: {
            kind: provenanceKind(value.provider),
            provider: value.provider,
            generated_by: 'sproochli-menu-translate',
            generated_at: FieldValue.serverTimestamp(),
          },
          updated_at: FieldValue.serverTimestamp(),
        } satisfies Omit<TranslationMemoryRecord, 'provenance'> & {
          provenance: TranslationMemoryRecord['provenance']
        })
        groupWrites += 1
      })

      return groupWrites
    })
  }

  return writes
}
