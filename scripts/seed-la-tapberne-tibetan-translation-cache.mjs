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
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const KITCHEN_SLUG = 'la-tapberne'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-la-tapberne-tibetan-translation-cache'
const DOMAIN = 'restaurant_menu'
const GLOSSARY_VERSION = 'restaurant_menu_v1'
const MENU_ID = 'main'
const TARGET_LANGUAGE = 'bo'
const ATTACHED_LANGUAGES = ['de', 'en', 'es', 'pt']

const normalizeString = (value) => String(value ?? '').trim()

const TIBETAN_MENU = {
  name: 'Comida Casera',
  description: 'Tapas-Gastro-Pub · ཁྱིམ་བཟོའི་ཟས་',
  note: 'རིན་གོང་ཚང་མ CHF ནང་། MwSt. ཚུད་ཡོད།',
}

const TIBETAN_SECTION_LABELS = {
  'las-tapas': 'ཏ་པས་',
  'ein-bisschen-meer': 'མཚོ་ཟས་ཅུང་ཙམ་',
  kroketten: 'ཀྲོ་ཀེཊ་',
  salats: 'ས་ལད་',
  hauptgerichte: 'གཙོ་བའི་ཟས་',
  'chefs-special': 'མ་བྱན་གྱི་ཁྱད་ཆོས་',
  onlyhands: '"Onlyhands"',
  dessert: 'མངར་ཟས་',
}

const TIBETAN_DISHES = {
  aioli: {
    name: 'Aioli',
    description: 'སྒོག་པའི་མ་ཡོ་ནེས་',
  },
  bravas: {
    name: 'Bravas',
    description: 'ཚ་བའི་སོས་',
  },
  'tortilla-de-patata': {
    name: 'Tortilla de Patata',
    description: 'སི་པེན་གྱི་ཞོག་ཁོག་ཨོམ་ལེཊ་། Ø24cm། ཆུང་ 9.50། འབྲིང་ 16.-། ཆེ་ 25.-',
  },
  'gebratene-pimientos-de-padron': {
    name: 'Pimientos de Padrón བསྲེགས་པ་',
    description: 'རྒྱ་མཚོའི་ཚྭའི་བུར་མ་དང་མཉམ་',
  },
  'portobello-al-ajillo': {
    name: 'Portobello al Ajillo',
    description: 'Portobello ཤ་མོ་སྒོག་པ་དང་མེ་ཏོག་ཚ་ལུ་མའི་སྣུམ་ནང་',
  },
  'panierte-camembert': {
    name: 'Camembert པན་ཏེ་',
    description: 'ཀྲོ་མ་ཀྲོའི་ཇམ་དང་མཉམ་',
  },
  'buffalo-schwein-ribs': {
    name: 'Buffalo ཕག་ཤ་རིབས་',
    description: 'ཚ་བའི་སོས་དང་མཉམ་། ཕོམས་དང་མཉམ་ 27.-',
  },
  'the-famous-schweinebauch-albarino-teriyaki': {
    name: '"The Famous" Albariño Teriyaki ཕག་ཤ་གྲོད་པ་',
    description: 'ཝ་ཀ་མེ་ས་ལད་། Cipollotte དང་ཏིལ་། ཕོམས་དང་མཉམ་ 25.-',
  },
  'crispy-chicken-fingers': {
    name: 'Crispy Chicken Fingers',
    description: 'ཁྱིམ་བཟོའི་བྱ་ཤ་ཁ་བསུབས་ 5། ཚ་བའི་པིཀལ་། Guacamole དང་ Aioli སོས་། ཕོམས་དང་མཉམ་ 25.-',
  },
  'black-tiger-al-ajillo': {
    name: 'Black Tiger al Ajillo',
    description: 'ཤྲིམཔ་ སྒོག་པ་དང་མེ་ཏོག་ཚ་ལུ་མའི་སྣུམ་ནང་',
  },
  'calamares-knusperli': {
    name: 'Calamares Knusperli',
    description: 'Aioli དང་བསྲེགས་པའི་ལེ་མོན་དང་མཉམ་',
  },
  'pulpo-a-la-gallega': {
    name: 'Pulpo a la Gallega',
    description: 'ག་ལི་ཤི་ཡའི་ལུགས་ཀྱི་ཨོག་ཊོ་པས་། ཨོ་ལིབ་སྣུམ་། སྤོས་བཏང་བའི་པ་པྲི་ཀ་། "cachelos" ཞོག་ཁོག་',
  },
  'gegrillter-pulpo': {
    name: 'Pulpo བསྲེགས་པ་',
    description: 'Chimichurri དང་ཚ་བའི་ Hummus',
  },
  'jamon-kroketten': {
    name: 'Jamón',
    description: 'Serrano ཕག་ཤ་ཧམ་',
  },
  'trueffel-kroketten': {
    name: 'Trüffel',
    description: 'ཤ་མོ་དང་ truffle སྣུམ་',
  },
  'gemischter-salat': {
    name: 'སྣ་འདྲེས་ས་ལད་',
    description: 'La Tapberne ས་ལད་སོས་དང་མཉམ་',
  },
  'bloody-mary-burrata': {
    name: 'Bloody Mary Burrata',
    description: 'ཀྲོ་མ་ཀྲོ་། celery། ཙོང་དམར་པོ་། Bloody Mary སོས་',
  },
  'tapberne-nuessler-salat': {
    name: 'Tapberne Nüssler Salat',
    description: 'ཕག་ཤ་གྲོད་པ་། སྒོང་ང་། བསྲེགས་པའི་བག་ལེབ་། སོས་',
  },
  'caesar-crispy-poulet-salat': {
    name: 'Caesar Crispy Poulet Salat',
    description: 'ཕག་ཤ་བེ་ཀོན་། Manchego ཕྱུར་བ་། Caesar སོས་',
  },
  'zorza-schwein-poulet': {
    name: 'Zorza ཕག་ཤ་/བྱ་ཤ་',
    description: 'བསྒོས་པའི་ཕག་ཤའམ་བྱ་ཤ་བཀོག་མ་། Pommes allumettes དང་བསྲེགས་པའི་ paprika སྟེང་། ཁ་སྣོན་: Manchego 2.50། སྒོང་ང་བསྲེགས་ 2.50',
  },
  'huevos-rotos-con-cecina': {
    name: 'Huevos Rotos con Cecina',
    description: 'Cecina ཤ་སྐམ་། སྒོང་ང་བསྲེགས་ 2། Rustico Frites། ཁ་སྣོན་: Manchego 2.50། truffle སྣུམ་ 2.50',
  },
  'fish-and-chips': {
    name: 'Fish and Chips',
    description: 'བེར་གྱི་ཕྱེ་ནང་ཁ་བསུབས་པའི་ Egli ཉ་ཤ་། གསར་པའི་ tartar སོས་། ཁྱིམ་བཟོའི་པིཀལ་། ཕོམས་',
  },
  'el-cachopo': {
    name: 'El Cachopo',
    description: 'Asturian གླང་ཤའི་ "Cordon Bleu"། Cecina དང་ Manchego ཕྱུར་བས་བཀང་བ་། ང་ཚོའི་ Patatas དང་ Pimientos de Padrón དང་མཉམ་',
  },
  'picanha-smashburger': {
    name: 'Picanha Smashburger',
    description: 'ཁྱིམ་བཟོའི་གླང་ཤ་ rump patties གཉིས་། ཕྱུར་བ་ཉིས་བསྒྱུར་། Romesco སོས་། Nüsslisalat། ཙོང་བསྲེགས་། brioche བག་ལེབ་། Rustico Frites དང་མཉམ་',
  },
  'the-vegi-smashburger': {
    name: 'The Vegi Smashburger',
    description: '',
  },
  'la-tapberne-francesinha-pulled-beef-sandwich': {
    name: 'La Tapberne Francesinha Pulled Beef Sandwich',
    description: 'Toast བག་ལེབ་། pulled beef། Cecina། ཕྱུར་བ་བསྲེགས་པ་། སྒོང་ང་བསྲེགས་། "Francesinha" སོས་། ཕོམས་དང་མཉམ་',
  },
  'hot-dog': {
    name: 'Hot Dog',
    description: 'ཕྱུར་བ་རིགས་གཉིས་། ཀྲོ་མ་ཀྲོའི་ཇམ་། mustard། ཙོང་དམར་པོའི་པིཀལ་། ཕག་ཤ་གྲོད་པའི་ཅིབས་ "Torreznos"། ཕོམས་དང་མཉམ་',
  },
  'hot-dog-vegi': {
    name: 'Hot Dog Vegi',
    description: '',
  },
  'egli-sandwich': {
    name: 'Egli Sandwich',
    description: 'སླ་བ་དང་ཞིམ་པ་། Ciabatta བག་ལེབ་ནང་ Egli Knusperli། tartar སོས་དང་ས་ལད་',
  },
  'serrano-sandwich': {
    name: 'Serrano Sandwich',
    description: 'Jamón Serrano། Burrata། ཀྲོ་མ་ཀྲོ་། Ciabatta བག་ལེབ་དང་མཉམ་',
  },
  'churro-bites': {
    name: 'Churro Bites',
    description: 'ཆུང་ཆུང་ Churro snacks། cinnamon བུ་རམ་དང་ཤོ་ཀོ་ལཱ་སོས་',
  },
  cheesecake: {
    name: 'Cheesecake',
    description: 'གྲང་མོ་། ཁྱིམ་བཟོའི་ཀོན་ཕི་ཐུར་དང་མཉམ་',
  },
  'happy-tarta-de-santiago': {
    name: 'Happy Tarta de Santiago',
    description: 'སི་པེན་གྱི་ almond cake། རཱམ་རེ་སིན་འཁྱགས་ཀྲིམ་དང་མཉམ་',
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

async function readJsonFile(pathValue, label) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`${label} file not found: ${pathValue}`)
  }

  return {
    data: JSON.parse(await readFile(resolvedPath, 'utf8')),
    resolvedPath,
  }
}

async function readServiceAccount(pathValue) {
  const { data, resolvedPath } = await readJsonFile(pathValue, 'Service account')
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account: data, resolvedPath }
}

function printHelp() {
  console.log(`
Seed La Tapberne Tibetan translation cache.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-la-tapberne-tibetan-translation-cache.mjs [--commit]

Options:
  --commit                         Write Firestore cache docs.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function sourceHash(sourceText) {
  return createHash('sha256').update(normalizeString(sourceText), 'utf8').digest('hex')
}

function makeMenuTranslationCacheKey(fieldId, targetLanguage) {
  const fieldHash = createHash('sha256')
    .update([normalizeString(fieldId), normalizeString(targetLanguage)].join('\n'), 'utf8')
    .digest('hex')

  if (!fieldId || !targetLanguage) return ''
  return `${targetLanguage}__${fieldHash.slice(0, 40)}`
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function buildCacheDoc({ fieldId, sourceText, translatedText, sourceLanguage = 'default' }) {
  const id = makeMenuTranslationCacheKey(fieldId, TARGET_LANGUAGE)

  return {
    id,
    field_id: fieldId,
    domain: DOMAIN,
    glossary_version: GLOSSARY_VERSION,
    source_language: sourceLanguage,
    target_language: TARGET_LANGUAGE,
    source_text: normalizeString(sourceText),
    translated_text: normalizeString(translatedText),
    provider: 'manual',
    reviewed: true,
    certified: false,
    source_hash: sourceHash(sourceText),
    usage_count: 0,
    created: updatedStamp(),
    updated: updatedStamp(),
  }
}

function menuFieldId(menuId, field) {
  return `menu:${menuId}:${field}`
}

function sectionFieldId(menuId, sectionId, field) {
  return `menu:${menuId}:section:${sectionId}:${field}`
}

function itemFieldId(menuId, sectionId, itemId, field) {
  return `menu:${menuId}:section:${sectionId}:item:${itemId}:${field}`
}

function dishFieldId(dishId, field) {
  return `dish:${dishId}:${field}`
}

function translatedSourceText(defaultText, translations) {
  return normalizeString(defaultText) ||
    normalizeString(translations?.de) ||
    normalizeString(translations?.en)
}

function addCacheDoc(docs, missing, input) {
  const fieldId = normalizeString(input.fieldId)
  const sourceText = normalizeString(input.sourceText)
  const translatedText = normalizeString(input.translatedText)

  if (!fieldId || !sourceText) return
  if (!translatedText) {
    missing.push({
      field_id: fieldId,
      source_text: sourceText,
    })
    return
  }

  docs.push(buildCacheDoc({
    fieldId,
    sourceText,
    translatedText,
    sourceLanguage: input.sourceLanguage,
  }))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const commit = Boolean(args.commit)
  const app = initializeApp(
    { credential: cert(account), projectId },
    'seed-la-tapberne-tibetan-translation-cache'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchensRef = db.collection(kitchenCollectionPath)
  const slugSnap = await kitchensRef.where('slug', '==', KITCHEN_SLUG).limit(1).get()

  if (slugSnap.empty) {
    throw new Error(`Kitchen not found by slug: ${KITCHEN_SLUG}`)
  }

  const kitchenRef = slugSnap.docs[0].ref
  const kitchenData = slugSnap.docs[0].data() || {}
  const menuRef = kitchenRef.collection('menus').doc(MENU_ID)
  const menuSnap = await menuRef.get()

  if (!menuSnap.exists) {
    throw new Error(`Menu not found: ${menuRef.path}`)
  }

  const menu = menuSnap.data() || {}
  const dishIds = new Set()
  for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
    for (const item of Array.isArray(section.items) ? section.items : []) {
      const dishId = normalizeString(item.dish_id)
      if (dishId) dishIds.add(dishId)
    }
  }
  const dishSnaps = await Promise.all(
    Array.from(dishIds).map((dishId) => kitchenRef.collection('dishes').doc(dishId).get())
  )
  const dishesById = new Map(
    dishSnaps
      .filter((snap) => snap.exists)
      .map((snap) => [snap.ref.id, snap.data() || {}])
  )
  const docs = []
  const missing = []
  const knownBlankDescriptions = []
  const add = (fieldId, sourceText, translatedText, sourceLanguage = 'default') => {
    addCacheDoc(docs, missing, {
      fieldId,
      sourceText,
      translatedText,
      sourceLanguage,
    })
  }

  add(menuFieldId(MENU_ID, 'name'), menu.name || MENU_ID, TIBETAN_MENU.name)
  add(
    menuFieldId(MENU_ID, 'description'),
    translatedSourceText(menu.description, menu.descriptions),
    TIBETAN_MENU.description,
    'de'
  )
  add(menuFieldId(MENU_ID, 'note'), menu.note, TIBETAN_MENU.note)

  for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
    const sectionId = normalizeString(section.id)
    add(
      sectionFieldId(MENU_ID, sectionId, 'label'),
      section.label,
      TIBETAN_SECTION_LABELS[sectionId]
    )
    add(sectionFieldId(MENU_ID, sectionId, 'description'), section.description, '')

    for (const item of Array.isArray(section.items) ? section.items : []) {
      const itemId = normalizeString(item.id)
      const dishId = normalizeString(item.dish_id)
      if (!dishId) {
        add(itemFieldId(MENU_ID, sectionId, itemId, 'label'), item.label, '')
        add(itemFieldId(MENU_ID, sectionId, itemId, 'description'), item.description, '')
        continue
      }

      const dish = dishesById.get(dishId)
      const translation = TIBETAN_DISHES[dishId]
      if (!dish) {
        missing.push({
          field_id: dishFieldId(dishId, 'name'),
          source_text: '[missing dish document]',
        })
        continue
      }

      add(dishFieldId(dishId, 'name'), dish.name || dishId, translation?.name)
      const sourceDescription = translatedSourceText(dish.description, dish.descriptions)
      if (!sourceDescription) {
        knownBlankDescriptions.push(dishId)
      }
      add(
        dishFieldId(dishId, 'description'),
        sourceDescription,
        translation?.description,
        'de'
      )
    }
  }

  const cacheLanguages = Array.from(new Set([
    ...(Array.isArray(kitchenData.language_settings?.cache_languages)
      ? kitchenData.language_settings.cache_languages
      : []),
    TARGET_LANGUAGE,
  ]))
  const publicLanguages = Array.from(new Set([
    ...ATTACHED_LANGUAGES,
    ...cacheLanguages,
  ]))

  console.log('[seed] la-tapberne-tibetan-translation-cache prepared', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    cachePath: menuRef.collection('translation_cache').path,
    show: kitchenData.show,
    attachedLanguages: ATTACHED_LANGUAGES,
    cacheLanguages,
    targetLanguage: TARGET_LANGUAGE,
    totalDocs: docs.length,
    missing,
    knownBlankDescriptions,
  })

  if (!commit) return
  if (missing.length) {
    throw new Error(`Refusing to write incomplete Tibetan cache: ${missing.length} missing values`)
  }

  let batch = db.batch()
  let ops = 0

  batch.set(
    kitchenRef,
    {
      show: true,
      design: {
        color_mode: 'dark',
      },
      language_settings: {
        default_language: 'de',
        supported_languages: publicLanguages,
        public_languages: publicLanguages,
        attached_languages: ATTACHED_LANGUAGES,
        sproochli: true,
        cache_languages: cacheLanguages,
      },
      supported_languages: publicLanguages,
      updated: updatedStamp(),
    },
    { merge: true }
  )
  ops += 1

  for (const doc of docs) {
    batch.set(menuRef.collection('translation_cache').doc(doc.id), doc, { merge: false })
    ops += 1
    if (ops >= 450) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()

  console.log('[seed] la-tapberne-tibetan-translation-cache done', {
    written: {
      kitchen: 1,
      cacheDocs: docs.length,
    },
    language_settings: {
      attached_languages: ATTACHED_LANGUAGES,
      cache_languages: cacheLanguages,
    },
    routes: [
      '/kitchens/la-tapberne/menus/main?lang=bo',
    ],
    knownBlankDescriptions,
  })
}

main().catch((error) => {
  console.error('[seed] la-tapberne-tibetan-translation-cache failed')
  console.error(error)
  process.exitCode = 1
})
