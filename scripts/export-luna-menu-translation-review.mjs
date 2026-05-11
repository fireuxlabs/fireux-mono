#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_OUTPUT_PATH = 'docs/luna-menu-translation-review.md'
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const MENU_IDS = ['main', 'pizza']
const REVIEW_MODES = ['', 'de', 'en', 'it', 'fr', 'ar']
const CACHE_LANGUAGES = new Set(['fr', 'ar'])
const MODE_LABELS = {
  '': 'default',
  de: 'de',
  en: 'en',
  it: 'it',
  fr: 'fr',
  ar: 'ar',
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
Export Luna Piccante menu translations to a human review markdown file.

This is read-only. It does not modify Firestore.

Usage:
  node scripts/export-luna-menu-translation-review.mjs [--output docs/luna-menu-translation-review.md]

Options:
  --output <path>                 Markdown output path.
  --project <id>                  Firebase project id.
  --database <id>                 Firestore database id. Defaults to misebox.
  --service-account <path>        Service account JSON path.
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

function mdCell(value) {
  const text = normalizeString(value)
  if (!text) return '—'

  return text
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>')
}

function table(headers, rows) {
  return [
    `| ${headers.map(mdCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(mdCell).join(' | ')} |`),
  ].join('\n')
}

function modeRows(valuesByMode, columns) {
  return REVIEW_MODES.map((mode) => [
    MODE_LABELS[mode],
    ...columns.map((column) => valuesByMode[mode]?.[column] ?? ''),
  ])
}

function localeForLanguage(language) {
  if (language === 'en') return 'en-GB'
  if (language === 'it') return 'it-CH'
  if (language === 'fr') return 'fr-CH'
  if (language === 'ar') return 'ar'
  return 'de-CH'
}

function priceUnitLabel(unit, language) {
  const normalizedUnit = normalizeString(unit).toLowerCase()
  if (normalizedUnit === 'piece') {
    if (language === 'ar') return 'قطع'
    if (language === 'fr') return 'pièces'
    if (language === 'it') return 'pz.'
    return language === 'en' ? 'pcs' : 'Stk.'
  }
  if (normalizedUnit === 'gram') {
    if (language === 'ar') return 'غ'
    return language === 'en' || language === 'fr' || language === 'it' ? 'g' : 'gr'
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

function resolveText({
  defaultText,
  translations,
  language,
  cache,
  cacheFieldId,
  missing,
  context,
}) {
  const fallback = normalizeString(defaultText)
  if (!language) return { text: fallback, source: 'default' }

  if (CACHE_LANGUAGES.has(language)) {
    const text = normalizeString(cache.get(`${language}:${cacheFieldId}`))
    if (text) return { text, source: 'cache' }

    missing.push({
      mode: language,
      context,
      fieldId: cacheFieldId,
    })
    return { text: fallback, source: 'fallback' }
  }

  if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
    const text = normalizeString(translations[language])
    if (text) return { text, source: 'attached' }
  }

  missing.push({
    mode: language,
    context,
    fieldId: cacheFieldId,
  })
  return { text: fallback, source: 'fallback' }
}

async function readCache(menuRef) {
  const snapshot = await menuRef.collection('translation_cache').get()
  const cache = new Map()

  snapshot.forEach((doc) => {
    const data = doc.data() || {}
    const fieldId = normalizeString(data.field_id)
    const targetLanguage = normalizeString(data.target_language)
    const translatedText = normalizeString(data.translated_text)
    if (fieldId && targetLanguage && translatedText) {
      cache.set(`${targetLanguage}:${fieldId}`, translatedText)
    }
  })

  return cache
}

function collectDishIds(menu) {
  const ids = new Set()
  const sections = Array.isArray(menu.sections) ? menu.sections : []

  for (const section of sections) {
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

function resolvedMenuName({ menuId, menu, cache, missing }) {
  return Object.fromEntries(
    REVIEW_MODES.map((language) => {
      const resolved = resolveText({
        defaultText: menu.name,
        translations: menu.names,
        language,
        cache,
        cacheFieldId: menuFieldId(menuId, 'name'),
        missing,
        context: `${menuId} menu name`,
      })

      return [language, { name: resolved.text }]
    })
  )
}

function resolvedSectionLabels({ menuId, section, cache, missing }) {
  return Object.fromEntries(
    REVIEW_MODES.map((language) => {
      const resolved = resolveText({
        defaultText: section.label,
        translations: section.labels,
        language,
        cache,
        cacheFieldId: sectionFieldId(menuId, section.id, 'label'),
        missing,
        context: `${menuId}/${section.id} section label`,
      })

      return [language, { label: resolved.text }]
    })
  )
}

function resolvedEntry({ menuId, section, item, dish, cache, missing, kitchen }) {
  return Object.fromEntries(
    REVIEW_MODES.map((language) => {
      const price = formatMenuItemPrice(item, kitchen, language)

      if (dish) {
        const name = resolveText({
          defaultText: dish.name,
          translations: dish.names,
          language,
          cache,
          cacheFieldId: dishFieldId(dish.id, 'name'),
          missing,
          context: `${menuId}/${section.id}/${dish.id} dish name`,
        })
        const description = resolveText({
          defaultText: dish.description,
          translations: dish.descriptions,
          language,
          cache,
          cacheFieldId: dishFieldId(dish.id, 'description'),
          missing,
          context: `${menuId}/${section.id}/${dish.id} dish description`,
        })

        return [language, { name: name.text, description: description.text, price }]
      }

      const name = resolveText({
        defaultText: item.label,
        translations: item.labels,
        language,
        cache,
        cacheFieldId: itemFieldId(menuId, section.id, item.id, 'label'),
        missing,
        context: `${menuId}/${section.id}/${item.id} inline item label`,
      })
      const description = resolveText({
        defaultText: item.description,
        translations: item.descriptions,
        language,
        cache,
        cacheFieldId: itemFieldId(menuId, section.id, item.id, 'description'),
        missing,
        context: `${menuId}/${section.id}/${item.id} inline item description`,
      })

      return [language, { name: name.text, description: description.text, price }]
    })
  )
}

function writeMenuMarkdown({ menuId, menu, sections, cache, dishesById, missing, stats, kitchen }) {
  const lines = []
  const menuTitle = menu.name || menuId
  lines.push(`# Menu: ${menuId === 'main' ? 'Main' : 'Pizza'}`)
  lines.push('')
  lines.push('## Menu name')
  lines.push('')
  lines.push(table(['Mode', 'Name'], modeRows(resolvedMenuName({ menuId, menu, cache, missing }), ['name'])))
  lines.push('')

  for (const section of sections) {
    const sectionId = normalizeString(section.id)
    const sectionLabel = normalizeString(section.label) || sectionId
    stats.sections += 1
    lines.push(`## Section: ${sectionLabel}`)
    lines.push('')
    lines.push('### Section labels')
    lines.push('')
    lines.push(
      table(
        ['Mode', 'Label'],
        modeRows(resolvedSectionLabels({ menuId, section, cache, missing }), ['label'])
      )
    )
    lines.push('')

    const items = (Array.isArray(section.items) ? section.items : [])
      .filter((item) => item?.active !== false)
      .slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))

    for (const item of items) {
      const dishId = normalizeString(item.dish_id)
      const dish = dishId ? dishesById.get(dishId) : null
      const entryTitle = normalizeString(dish?.name || item.label || item.id || dishId)
      const entry = resolvedEntry({ menuId, section, item, dish, cache, missing, kitchen })
      stats.entries += 1

      lines.push(`### ${entryTitle}`)
      lines.push('')
      lines.push(`ID: \`${dishId || item.id}\``)
      const defaultPrice = entry['']?.price
      if (defaultPrice) lines.push(`Price: ${defaultPrice}`)
      lines.push('')
      lines.push(table(['Mode', 'Name', 'Description', 'Price'], modeRows(entry, ['name', 'description', 'price'])))
      lines.push('')
    }
  }

  if (!sections.length) {
    lines.push(`_No sections found for ${menuTitle}._`)
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const outputPath = resolveRepoPath(
    typeof args.output === 'string' ? normalizeString(args.output) : DEFAULT_OUTPUT_PATH
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
  const app = initializeApp(
    { credential: cert(account), projectId },
    'export-luna-menu-translation-review'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.collection('kitchens').doc(LUNA_KITCHEN_ID)
  const kitchenSnap = await kitchenRef.get()
  if (!kitchenSnap.exists) throw new Error(`Missing Luna kitchen: ${LUNA_KITCHEN_ID}`)
  const kitchen = { id: kitchenSnap.id, ...(kitchenSnap.data() || {}) }

  const missing = []
  const stats = {
    menus: 0,
    sections: 0,
    entries: 0,
  }
  const lines = [
    '# Luna Piccante Menu Translation Review',
    '',
    '## Notes',
    '',
    '- Default/original is the restaurant’s menu voice. It may be mixed Italian/German.',
    '- German, English, and Italian are attached/certified language maps.',
    '- French and Arabic are menu-scoped cached translations.',
    '- Arabic may keep original dish names in Latin script to help guests order by pointing/showing the waiter.',
    '- Prices are shown only for context.',
    '- This file is for human language review, not public rendering.',
    '',
    `Generated from Firestore kitchen \`${LUNA_KITCHEN_ID}\`.`,
    '',
  ]

  for (const menuId of MENU_IDS) {
    const menuRef = kitchenRef.collection('menus').doc(menuId)
    const menuSnap = await menuRef.get()
    if (!menuSnap.exists) {
      missing.push({ mode: 'all', context: `${menuId} menu`, fieldId: menuRef.path })
      continue
    }

    const menu = { id: menuId, ...(menuSnap.data() || {}) }
    const sections = (Array.isArray(menu.sections) ? menu.sections : [])
      .slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    const dishesById = await readDishes(kitchenRef, collectDishIds(menu))
    const cache = await readCache(menuRef)

    stats.menus += 1
    lines.push(writeMenuMarkdown({ menuId, menu, sections, cache, dishesById, missing, stats, kitchen }))
  }

  lines.push('# Export Summary')
  lines.push('')
  lines.push(`- Menus exported: ${stats.menus}`)
  lines.push(`- Sections exported: ${stats.sections}`)
  lines.push(`- Entries exported: ${stats.entries}`)
  lines.push(`- Missing language values / fallbacks detected: ${missing.length}`)
  lines.push('')

  if (missing.length) {
    lines.push('## Missing Values / Fallbacks')
    lines.push('')
    lines.push(table(
      ['Mode', 'Context', 'Field ID'],
      missing.map((entry) => [entry.mode, entry.context, entry.fieldId])
    ))
    lines.push('')
  }

  await writeFile(outputPath, `${lines.join('\n').trim()}\n`, 'utf8')

  console.log('[export-luna-menu-translation-review] done', {
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    outputPath,
    menus: stats.menus,
    sections: stats.sections,
    entries: stats.entries,
    missing: missing.length,
  })
}

main().catch((error) => {
  console.error('[export-luna-menu-translation-review] failed')
  console.error(error?.stack || error?.message || error)
  process.exitCode = 1
})
