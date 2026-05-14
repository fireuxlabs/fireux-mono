#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'
import { LA_TAPBERNE_CACHE_LANGUAGES } from './seed-la-tapberne-translation-cache.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const DEFAULT_OUTPUT_DIR = 'docs/reviews/la-tapberne'
const KITCHEN_SLUG = 'la-tapberne'
const MENU_ID = 'main'
const EXPORT_LANGUAGES = ['', 'de', 'en', 'es', 'pt', 'fr', 'it', 'ar', 'he', 'ko', 'ja']
const CACHE_LANGUAGE_CODES = new Set(LA_TAPBERNE_CACHE_LANGUAGES)

const LANGUAGE_LABELS = {
  '': 'Default',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  it: 'Italian',
  ar: 'Arabic',
  he: 'Hebrew',
  ko: 'Korean',
  ja: 'Japanese',
}

const LANGUAGE_FILE_NAMES = {
  '': 'default',
  de: 'de',
  en: 'en',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  it: 'it',
  ar: 'ar',
  he: 'he',
  ko: 'ko',
  ja: 'ja',
}

const normalizeString = (value) => String(value ?? '').trim()

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
Export La Tapberne menu translations to human review markdown files.

This is read-only. It does not modify Firestore.

Usage:
  node scripts/export-la-tapberne-menu-review.mjs [--output-dir docs/reviews/la-tapberne]

Options:
  --output-dir <path>             Output directory for markdown review files.
  --project <id>                  Firebase project id.
  --database <id>                 Firestore database id. Defaults to misebox.
  --service-account <path>        Service account JSON path.
  --kitchen-collection <path>     Kitchen collection path. Defaults to kitchens.
`)
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

function md(value) {
  const text = normalizeString(value)
  return text || '—'
}

function inlineCode(value) {
  return `\`${normalizeString(value).replace(/`/g, '\\`')}\``
}

function localeForLanguage(language) {
  if (language === 'en') return 'en-GB'
  if (language === 'it') return 'it-CH'
  if (language === 'fr') return 'fr-CH'
  if (language === 'pt') return 'pt-PT'
  if (language === 'es') return 'es-ES'
  if (language === 'ar') return 'ar'
  if (language === 'he') return 'he'
  if (language === 'ko') return 'ko-KR'
  if (language === 'ja') return 'ja-JP'
  return 'de-CH'
}

function priceUnitLabel(unit, language) {
  const normalizedUnit = normalizeString(unit).toLowerCase()
  if (normalizedUnit === 'piece') {
    if (language === 'ar') return 'قطع'
    if (language === 'he') return 'יח׳'
    if (language === 'fr') return 'pièces'
    if (language === 'it') return 'pz.'
    if (language === 'pt') return 'un.'
    if (language === 'es') return 'uds.'
    if (language === 'ko') return '개'
    if (language === 'ja') return '個'
    return language === 'en' ? 'pcs' : 'Stk.'
  }
  if (normalizedUnit === 'gram') {
    if (language === 'ar') return 'غ'
    if (language === 'he') return 'ג'
    return language === 'en' || language === 'fr' || language === 'it' || language === 'pt' || language === 'es'
      ? 'g'
      : 'gr'
  }
  return normalizedUnit
}

function formatPrice(value, kitchen, language) {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount) || amount <= 0) return ''

  const currencyCode = normalizeString(kitchen.currency_code).toUpperCase() || 'CHF'
  const currencyFormat = normalizeString(kitchen.currency_format).toLowerCase()
  const resolvedCurrencyFormat =
    currencyFormat === 'dash' || currencyFormat === 'symbol' || currencyFormat === 'code'
      ? currencyFormat
      : currencyCode === 'CHF'
        ? 'dash'
        : 'symbol'

  if (resolvedCurrencyFormat === 'dash') {
    if (amount % 1 === 0) return `${amount}.-`
    return amount.toFixed(2)
  }

  return new Intl.NumberFormat(localeForLanguage(language), {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: resolvedCurrencyFormat === 'code' ? 'code' : 'narrowSymbol',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatPriceOption(option, kitchen, language) {
  const quantity = Number(option?.quantity ?? 0)
  const price = formatPrice(option?.price, kitchen, language)
  if (!Number.isFinite(quantity) || quantity <= 0 || !price) return ''

  const unit = priceUnitLabel(option?.unit, language)
  const quantityLabel = unit === 'gr'
    ? `${quantity}${unit}`
    : `${quantity} ${unit}`.trim()

  return `${quantityLabel} ${price}`.trim()
}

function formatMenuItemPrice(item, kitchen, language) {
  if (Array.isArray(item?.price_options) && item.price_options.length) {
    return item.price_options
      .map((option) => formatPriceOption(option, kitchen, language))
      .filter(Boolean)
      .join(' / ')
  }

  return formatPrice(item?.price, kitchen, language)
}

async function readCache(menuRef) {
  const snapshot = await menuRef.collection('translation_cache').get()
  const cache = new Map()
  const languages = new Set()

  snapshot.forEach((doc) => {
    const data = doc.data() || {}
    const fieldId = normalizeString(data.field_id)
    const targetLanguage = normalizeString(data.target_language)
    const translatedText = normalizeString(data.translated_text)
    if (targetLanguage) languages.add(targetLanguage)
    if (fieldId && targetLanguage && translatedText) {
      cache.set(`${targetLanguage}:${fieldId}`, translatedText)
    }
  })

  return { cache, cacheDocLanguages: Array.from(languages).sort() }
}

function collectDishIds(menu) {
  const ids = new Set()
  for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
    for (const item of Array.isArray(section.items) ? section.items : []) {
      const dishId = normalizeString(item.dish_id)
      if (dishId) ids.add(dishId)
    }
  }
  return Array.from(ids)
}

async function readDishes(kitchenRef, ids) {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const snap = await kitchenRef.collection('dishes').doc(id).get()
      return snap.exists ? [id, { id, ...(snap.data() || {}) }] : [id, null]
    })
  )

  return new Map(entries.filter(([, dish]) => dish))
}

function sourceReference(defaultText, translations = {}) {
  return normalizeString(defaultText) ||
    normalizeString(translations.de) ||
    normalizeString(translations.en)
}

function resolveText({
  defaultText,
  translations,
  language,
  cache,
  cacheFieldId,
  missing,
  context,
  required = true,
}) {
  if (!language) {
    return {
      text: normalizeString(defaultText),
      source: 'default',
      missing: false,
    }
  }

  let text = ''
  let source = 'attached'

  if (CACHE_LANGUAGE_CODES.has(language)) {
    text = normalizeString(cache.get(`${language}:${cacheFieldId}`))
    source = 'cache'
  } else if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
    text = normalizeString(translations[language])
  }

  if (!text && required) {
    missing.push({
      language,
      context,
      field_id: cacheFieldId,
    })
  }

  return { text, source, missing: !text && required }
}

function lineBlock(label, value) {
  return [`${label}:`, '', md(value), '']
}

function pushReviewEntry(lines, {
  title,
  id,
  price,
  translationName,
  translationDescription,
  sourceName,
  sourceDescription,
  sourceReferenceDescription,
  notes,
}) {
  lines.push(`### ${md(title)}`)
  lines.push('')
  lines.push(`ID: ${inlineCode(id)}`)
  if (price) lines.push(`Price: ${price}`)
  if (notes.length) lines.push(`Notes: ${notes.join('; ')}`)
  lines.push('')
  lines.push(...lineBlock('Translation name', translationName))
  lines.push(...lineBlock('Translation description', translationDescription))
  lines.push(...lineBlock('Source/default name', sourceName))
  lines.push(...lineBlock('Source/default description', sourceDescription))
  if (!normalizeString(sourceDescription) && normalizeString(sourceReferenceDescription)) {
    lines.push(...lineBlock('Source reference description', sourceReferenceDescription))
  }
}

function buildLanguageMarkdown({
  language,
  kitchen,
  menu,
  sections,
  dishesById,
  cache,
  missing,
  blankDescriptions,
  preservedNames,
}) {
  const label = LANGUAGE_LABELS[language] || language
  const lines = [
    `# La Tapberne — ${label}`,
    '',
    'This file is for human menu-language review. It is generated from Firestore, not from the deployed site.',
    '',
    `Kitchen: ${md(kitchen.display_name || kitchen.name || kitchen.id)}`,
    `Menu: ${md(resolveText({
      defaultText: menu.name,
      translations: menu.names,
      language,
      cache,
      cacheFieldId: menuFieldId(MENU_ID, 'name'),
      missing,
      context: 'menu name',
    }).text)}`,
    '',
  ]

  const menuDescription = resolveText({
    defaultText: menu.description,
    translations: menu.descriptions,
    language,
    cache,
    cacheFieldId: menuFieldId(MENU_ID, 'description'),
    missing,
    context: 'menu description',
    required: Boolean(sourceReference(menu.description, menu.descriptions)),
  })
  const menuNote = resolveText({
    defaultText: menu.note,
    translations: menu.notes,
    language,
    cache,
    cacheFieldId: menuFieldId(MENU_ID, 'note'),
    missing,
    context: 'menu note',
    required: Boolean(sourceReference(menu.note, menu.notes)),
  })

  if (menuDescription.text) {
    lines.push(`Description: ${menuDescription.text}`)
    lines.push('')
  }
  if (menuNote.text) {
    lines.push(`Note: ${menuNote.text}`)
    lines.push('')
  }

  for (const section of sections) {
    const sectionId = normalizeString(section.id)
    const sectionLabel = resolveText({
      defaultText: section.label,
      translations: section.labels,
      language,
      cache,
      cacheFieldId: sectionFieldId(MENU_ID, sectionId, 'label'),
      missing,
      context: `${sectionId} section label`,
    })
    const sourceSectionLabel = normalizeString(section.label)

    lines.push(`## ${md(sectionLabel.text)}`)
    lines.push('')
    lines.push(`Source/default section: ${md(sourceSectionLabel)}`)
    lines.push('')

    const items = (Array.isArray(section.items) ? section.items : [])
      .filter((item) => item?.active !== false)
      .slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))

    for (const item of items) {
      const itemId = normalizeString(item.id)
      const dishId = normalizeString(item.dish_id)
      const dish = dishId ? dishesById.get(dishId) : null
      const fieldBaseId = dishId || itemId
      const sourceName = dish ? normalizeString(dish.name) : normalizeString(item.label)
      const sourceDescription = dish ? normalizeString(dish.description) : normalizeString(item.description)
      const referenceDescription = dish
        ? sourceReference(dish.description, dish.descriptions)
        : sourceReference(item.description, item.descriptions)

      const name = dish
        ? resolveText({
            defaultText: dish.name,
            translations: dish.names,
            language,
            cache,
            cacheFieldId: dishFieldId(dish.id, 'name'),
            missing,
            context: `${sectionId}/${dish.id} dish name`,
          })
        : resolveText({
            defaultText: item.label,
            translations: item.labels,
            language,
            cache,
            cacheFieldId: itemFieldId(MENU_ID, sectionId, itemId, 'label'),
            missing,
            context: `${sectionId}/${itemId} inline item label`,
          })

      const descriptionRequired = Boolean(referenceDescription)
      const description = dish
        ? resolveText({
            defaultText: dish.description,
            translations: dish.descriptions,
            language,
            cache,
            cacheFieldId: dishFieldId(dish.id, 'description'),
            missing,
            context: `${sectionId}/${dish.id} dish description`,
            required: descriptionRequired,
          })
        : resolveText({
            defaultText: item.description,
            translations: item.descriptions,
            language,
            cache,
            cacheFieldId: itemFieldId(MENU_ID, sectionId, itemId, 'description'),
            missing,
            context: `${sectionId}/${itemId} inline item description`,
            required: descriptionRequired,
          })

      const notes = []
      if (language && normalizeString(name.text) && normalizeString(name.text) === sourceName) {
        notes.push('preserved brand/dish name')
        preservedNames[language] += 1
      }
      if (!normalizeString(description.text)) {
        notes.push('blank description')
        blankDescriptions[language] += 1
      }

      pushReviewEntry(lines, {
        title: name.text || sourceName || fieldBaseId,
        id: fieldBaseId,
        price: formatMenuItemPrice(item, kitchen, language),
        translationName: name.text,
        translationDescription: description.text,
        sourceName,
        sourceDescription,
        sourceReferenceDescription: referenceDescription,
        notes,
      })
    }
  }

  return `${lines.join('\n').trim()}\n`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const outputDir = resolveRepoPath(
    typeof args['output-dir'] === 'string'
      ? normalizeString(args['output-dir'])
      : DEFAULT_OUTPUT_DIR
  )
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
  const app = initializeApp(
    { credential: cert(account), projectId },
    'export-la-tapberne-menu-review'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchensRef = db.collection(kitchenCollectionPath)
  const slugSnap = await kitchensRef.where('slug', '==', KITCHEN_SLUG).limit(1).get()

  if (slugSnap.empty) {
    throw new Error(`Kitchen not found by slug: ${KITCHEN_SLUG}`)
  }

  const kitchenRef = slugSnap.docs[0].ref
  const kitchen = { id: kitchenRef.id, ...(slugSnap.docs[0].data() || {}) }
  const menuRef = kitchenRef.collection('menus').doc(MENU_ID)
  const menuSnap = await menuRef.get()
  if (!menuSnap.exists) throw new Error(`Menu not found: ${menuRef.path}`)

  const menu = { id: MENU_ID, ...(menuSnap.data() || {}) }
  const sections = (Array.isArray(menu.sections) ? menu.sections : [])
    .slice()
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
  const dishesById = await readDishes(kitchenRef, collectDishIds(menu))
  const { cache, cacheDocLanguages } = await readCache(menuRef)
  const cacheLanguages = Array.isArray(kitchen.language_settings?.cache_languages)
    ? kitchen.language_settings.cache_languages.map(normalizeString).filter(Boolean)
    : []
  const exportedCacheLanguages = EXPORT_LANGUAGES.filter((language) => CACHE_LANGUAGE_CODES.has(language))
  const cacheLanguagesNotExported = cacheLanguages.filter((language) => !exportedCacheLanguages.includes(language))
  const exportedButNotPublicCache = exportedCacheLanguages.filter((language) => !cacheLanguages.includes(language))
  const extraCacheDocLanguages = cacheDocLanguages.filter((language) => !cacheLanguages.includes(language))
  const missing = []
  const blankDescriptions = Object.fromEntries(EXPORT_LANGUAGES.map((language) => [language, 0]))
  const preservedNames = Object.fromEntries(EXPORT_LANGUAGES.map((language) => [language, 0]))
  const files = []

  await mkdir(outputDir, { recursive: true })

  for (const language of EXPORT_LANGUAGES) {
    const markdown = buildLanguageMarkdown({
      language,
      kitchen,
      menu,
      sections,
      dishesById,
      cache,
      missing,
      blankDescriptions,
      preservedNames,
    })
    const fileName = `${LANGUAGE_FILE_NAMES[language]}.md`
    const outputPath = join(outputDir, fileName)
    await writeFile(outputPath, markdown, 'utf8')
    files.push(outputPath)
  }

  const allLanguages = []
  for (const language of EXPORT_LANGUAGES) {
    allLanguages.push(await readFile(join(outputDir, `${LANGUAGE_FILE_NAMES[language]}.md`), 'utf8'))
  }
  const combinedOutputPath = join(outputDir, 'all-languages.md')
  await writeFile(combinedOutputPath, allLanguages.join('\n---\n\n'), 'utf8')
  files.push(combinedOutputPath)

  const missingByLanguage = Object.fromEntries(
    EXPORT_LANGUAGES.map((language) => [
      LANGUAGE_FILE_NAMES[language],
      missing.filter((entry) => entry.language === language).length,
    ])
  )
  const incompleteCacheLanguages = cacheLanguages.filter((language) => missingByLanguage[language] > 0)
  const summaryPath = join(outputDir, 'summary.json')
  const summaryFiles = [...files, summaryPath]
  const summary = {
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    outputDir,
    languages: EXPORT_LANGUAGES.map((language) => LANGUAGE_FILE_NAMES[language]),
    cacheLanguages,
    cacheDocLanguages,
    cacheLanguagesNotExported,
    exportedButNotPublicCache,
    extraCacheDocLanguages,
    incompleteCacheLanguages,
    missingByLanguage,
    totalMissing: missing.length,
    blankDescriptions,
    preservedNames,
    files: summaryFiles,
  }

  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')

  console.log('[export-la-tapberne-menu-review] done', {
    projectId,
    databaseId,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    outputDir,
    files: summaryFiles.length,
    languages: summary.languages,
    cacheLanguages,
    cacheLanguagesNotExported,
    exportedButNotPublicCache,
    extraCacheDocLanguages,
    incompleteCacheLanguages,
    missingByLanguage,
    totalMissing: missing.length,
    blankDescriptions,
  })
}

main().catch((error) => {
  console.error('[export-la-tapberne-menu-review] failed')
  console.error(error?.stack || error?.message || error)
  process.exitCode = 1
})
