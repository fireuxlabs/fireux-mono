#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_SEED_PATH = 'scripts/data/restaurant-translation-glossary.seed.json'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-translation-glossary'
const GLOSSARY_COLLECTION = 'translation_glossary'

const normalizeString = (value) => String(value ?? '').trim()
const normalizeLanguageCode = (value) => normalizeString(value).replace(/_/g, '-')
const normalizeDomain = (value) =>
  normalizeString(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'general'
const normalizeGlossaryVersion = (value) =>
  normalizeString(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '_') ||
  'restaurant_menu_v1'

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let index = 0; index < 12; index += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readJson(pathValue) {
  return JSON.parse(await readFile(resolveRepoPath(pathValue), 'utf8'))
}

function makeTranslationGlossaryKey({ domain, sourceLanguage, sourceText }) {
  const normalizedDomain = normalizeDomain(domain)
  const normalizedLanguage = normalizeLanguageCode(sourceLanguage)
  const normalizedText = normalizeString(sourceText)
  const hash = createHash('sha256')
    .update([normalizedDomain, normalizedLanguage, normalizedText].join('\n'), 'utf8')
    .digest('hex')

  if (!normalizedLanguage || !normalizedText) return ''
  return `${normalizedDomain}__${normalizedLanguage}__${hash.slice(0, 40)}`
}

function buildDoc(input) {
  const translations = {}
  for (const [language, value] of Object.entries(input.translations || {})) {
    const code = normalizeLanguageCode(language)
    const text = normalizeString(value)
    if (code && text) translations[code] = text
  }

  return {
    id: input.id,
    domain: normalizeDomain(input.domain),
    glossary_version: normalizeGlossaryVersion(input.glossaryVersion),
    source_language: normalizeLanguageCode(input.sourceLanguage),
    source_text: normalizeString(input.sourceText),
    source_hash: createHash('sha256').update(normalizeString(input.sourceText), 'utf8').digest('hex'),
    kind: normalizeString(input.kind) || 'glossary',
    translations,
    verified: input.verified === true,
    provider: normalizeString(input.provider) || 'manual',
    usage_count: 0,
    created: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
      app_id: APP_ID,
    },
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

function expandEntries(seed) {
  const docs = new Map()
  const version = normalizeGlossaryVersion(seed.version)

  for (const entry of seed.entries || []) {
    const domain = normalizeDomain(entry.domain || 'restaurant_menu')
    const sourceLanguage = normalizeLanguageCode(entry.source_language || 'de')
    const sourceTexts = [
      normalizeString(entry.source_text),
      ...(Array.isArray(entry.aliases) ? entry.aliases.map(normalizeString) : []),
    ].filter(Boolean)

    for (const [language, text] of Object.entries(entry.translations || {})) {
      if (normalizeString(text)) sourceTexts.push(normalizeString(text))
    }

    for (const sourceText of Array.from(new Set(sourceTexts))) {
      const inferredLanguage = Object.entries(entry.translations || {}).find(
        ([, value]) => normalizeString(value) === sourceText
      )?.[0]
      const docSourceLanguage = inferredLanguage
        ? normalizeLanguageCode(inferredLanguage)
        : sourceLanguage
      const id = makeTranslationGlossaryKey({
        domain,
        sourceLanguage: docSourceLanguage,
        sourceText,
      })
      if (!id) continue

      docs.set(id, buildDoc({
        id,
        domain,
        glossaryVersion: version,
        sourceLanguage: docSourceLanguage,
        sourceText,
        translations: entry.translations || {},
        kind: entry.kind || 'glossary',
        provider: entry.provider || 'manual',
        verified: entry.verified === true,
      }))
    }
  }

  return Array.from(docs.values())
}

async function loadServiceAccount(pathValue) {
  const serviceAccount = await readJson(pathValue)
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error(`Invalid service account JSON: ${pathValue}`)
  }
  return serviceAccount
}

async function commitDocs(db, docs, options = {}) {
  let batch = db.batch()
  let ops = 0
  let written = 0
  let skipped = 0

  for (const doc of docs) {
    const ref = db.collection(GLOSSARY_COLLECTION).doc(doc.id)
    if (!options.overwrite && (await ref.get()).exists) {
      skipped += 1
      continue
    }

    batch.set(ref, doc, { merge: true })
    ops += 1
    written += 1

    if (ops >= 450) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()
  return { written, skipped }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const overwrite = Boolean(args.overwrite)
  const projectId = normalizeString(args.project || process.env.FIREBASE_PROJECT_ID) || DEFAULT_PROJECT_ID
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const seedPath =
    typeof args.seed === 'string' ? normalizeString(args.seed) : DEFAULT_SEED_PATH
  const seed = await readJson(seedPath)
  const docs = expandEntries(seed)

  if (!commit) {
    console.log('[translation-glossary] dry run', {
      collection: GLOSSARY_COLLECTION,
      seed: seedPath,
      docs: docs.length,
      sample_ids: docs.slice(0, 5).map((doc) => doc.id),
      apply: 'node scripts/seed-translation-glossary.mjs --commit',
      overwrite: 'node scripts/seed-translation-glossary.mjs --commit --overwrite',
    })
    return
  }

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId,
  }, `seed-translation-glossary-${Date.now()}`)
  const db = getFirestore(app)
  const result = await commitDocs(db, docs, { overwrite })

  console.log('[translation-glossary] seeded', {
    collection: GLOSSARY_COLLECTION,
    seed: seedPath,
    docs: docs.length,
    overwrite,
    ...result,
  })
}

main().catch((error) => {
  console.error('[translation-glossary] failed', error)
  process.exit(1)
})
