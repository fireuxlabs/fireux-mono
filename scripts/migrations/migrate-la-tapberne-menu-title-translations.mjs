#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from '../_lib/args.mjs'
import {
  LA_TAPBERNE_ATTACHED_LANGUAGES,
  LA_TAPBERNE_CACHE_LANGUAGES,
  LA_TAPBERNE_TRANSLATIONS,
} from '../seed-la-tapberne-translation-cache.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'apps/misebox-app/kitchens'
const DEFAULT_KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:migrate-la-tapberne-menu-title-translations'
const MENU_ID = 'main'
const DOMAIN = 'restaurant_menu'
const GLOSSARY_VERSION = 'restaurant_menu_v1'

const normalizeString = (value) => String(value ?? '').trim()

const ATTACHED_MENU = {
  names: {
    de: 'Hausgemachte Küche',
    en: 'Home Cooking',
    es: LA_TAPBERNE_TRANSLATIONS.es.menu.name,
    pt: LA_TAPBERNE_TRANSLATIONS.pt.menu.name,
  },
  descriptions: {
    de: 'Tapas-Gastro-Pub · Hausgemachte Küche',
    en: 'Tapas-Gastro-Pub · Homemade food',
    es: LA_TAPBERNE_TRANSLATIONS.es.menu.description,
    pt: LA_TAPBERNE_TRANSLATIONS.pt.menu.description,
  },
  notes: {
    de: 'Alle Preise in CHF inkl. MwSt.',
    en: 'All prices in CHF incl. VAT.',
    es: LA_TAPBERNE_TRANSLATIONS.es.menu.note,
    pt: LA_TAPBERNE_TRANSLATIONS.pt.menu.note,
  },
}

const EXTRA_CACHE_MENU = {
  bo: {
    name: 'ཁྱིམ་བཟོའི་ཟས་',
    description: 'Tapas-Gastro-Pub · ཁྱིམ་བཟོའི་ཟས་',
    note: 'རིན་གོང་ཚང་མ CHF ནང་། MwSt. ཚུད་ཡོད།',
  },
}

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let i = 0; i < 12; i += 1) {
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

async function readServiceAccount(pathValue) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`Service account file not found: ${pathValue}`)
  }

  const account = JSON.parse(await readFile(resolvedPath, 'utf8'))
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account, resolvedPath }
}

function printHelp() {
  console.log(`
Migrate La Tapberne menu title translations.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/migrations/migrate-la-tapberne-menu-title-translations.mjs [--commit]

Options:
  --commit                         Write Firestore docs.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path.
  --kitchen-id <id>                Kitchen doc id.
`)
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function sourceHash(sourceText) {
  return createHash('sha256').update(normalizeString(sourceText), 'utf8').digest('hex')
}

function cacheDocId(fieldId, targetLanguage) {
  const fieldHash = createHash('sha256')
    .update([normalizeString(fieldId), normalizeString(targetLanguage)].join('\n'), 'utf8')
    .digest('hex')
  return `${targetLanguage}__${fieldHash.slice(0, 40)}`
}

function menuFieldId(field) {
  return `menu:${MENU_ID}:${field}`
}

function cacheDoc({ field, sourceText, translatedText, targetLanguage, sourceLanguage }) {
  const fieldId = menuFieldId(field)

  return {
    id: cacheDocId(fieldId, targetLanguage),
    field_id: fieldId,
    domain: DOMAIN,
    glossary_version: GLOSSARY_VERSION,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    source_text: normalizeString(sourceText),
    translated_text: normalizeString(translatedText),
    provider: 'manual',
    reviewed: true,
    certified: false,
    source_hash: sourceHash(sourceText),
    updated: updatedStamp(),
  }
}

function cacheMenuForLanguage(language) {
  return LA_TAPBERNE_TRANSLATIONS[language]?.menu || EXTRA_CACHE_MENU[language] || null
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const serviceAccountPath = normalizeString(
    args['service-account'] ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      DEFAULT_SERVICE_ACCOUNT_PATH
  )
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId = normalizeString(args.database || DEFAULT_DATABASE_ID)
  const kitchenCollectionPath = normalizeString(
    args['kitchen-collection'] || DEFAULT_KITCHEN_COLLECTION_PATH
  )
  const kitchenId = normalizeString(args['kitchen-id'] || DEFAULT_KITCHEN_ID)
  const commit = Boolean(args.commit)

  const app = initializeApp(
    { credential: cert(account), projectId },
    'migrate-la-tapberne-menu-title-translations'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${kitchenId}`)
  const menuRef = kitchenRef.collection('menus').doc(MENU_ID)
  const [kitchenSnap, menuSnap] = await Promise.all([kitchenRef.get(), menuRef.get()])

  if (!kitchenSnap.exists) throw new Error(`Kitchen not found: ${kitchenRef.path}`)
  if (!menuSnap.exists) throw new Error(`Menu not found: ${menuRef.path}`)

  const cacheLanguages = [...new Set([...LA_TAPBERNE_CACHE_LANGUAGES, 'bo'])]
  const publicLanguages = [...new Set([...LA_TAPBERNE_ATTACHED_LANGUAGES, ...cacheLanguages])]
  const cacheDocs = cacheLanguages.flatMap((language) => {
    const menu = cacheMenuForLanguage(language)
    if (!menu) return []

    return [
      cacheDoc({
        field: 'name',
        sourceText: menuSnap.data()?.name || 'Comida Casera',
        translatedText: menu.name,
        targetLanguage: language,
        sourceLanguage: 'es',
      }),
      cacheDoc({
        field: 'description',
        sourceText: ATTACHED_MENU.descriptions.de,
        translatedText: menu.description,
        targetLanguage: language,
        sourceLanguage: 'de',
      }),
      cacheDoc({
        field: 'note',
        sourceText: ATTACHED_MENU.notes.de,
        translatedText: menu.note,
        targetLanguage: language,
        sourceLanguage: 'de',
      }),
    ]
  })

  console.log('[migrate] la-tapberne menu title translations prepared', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    attached: ATTACHED_MENU,
    cacheLanguages,
    cacheDocs: cacheDocs.map((doc) => ({
      id: doc.id,
      field_id: doc.field_id,
      target_language: doc.target_language,
      translated_text: doc.translated_text,
    })),
  })

  if (!commit) return

  const batch = db.batch()
  batch.set(
    kitchenRef,
    {
      sproochli_enabled: true,
      language_settings: {
        default_language: 'de',
        supported_languages: publicLanguages,
        public_languages: publicLanguages,
        attached_languages: LA_TAPBERNE_ATTACHED_LANGUAGES,
        sproochli: true,
        cache_languages: cacheLanguages,
      },
      supported_languages: publicLanguages,
      updated: updatedStamp(),
    },
    { merge: true }
  )
  batch.set(
    menuRef,
    {
      names: ATTACHED_MENU.names,
      descriptions: ATTACHED_MENU.descriptions,
      note: ATTACHED_MENU.notes.de,
      notes: ATTACHED_MENU.notes,
      updated: updatedStamp(),
    },
    { merge: true }
  )

  for (const doc of cacheDocs) {
    batch.set(
      menuRef.collection('translation_cache').doc(doc.id),
      doc,
      { merge: true }
    )
  }

  await batch.commit()

  console.log('[migrate] la-tapberne menu title translations done', {
    kitchen: kitchenRef.path,
    menu: menuRef.path,
    cacheDocs: cacheDocs.length,
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('[migrate] la-tapberne menu title translations failed')
    console.error(error)
    process.exitCode = 1
  })
}
