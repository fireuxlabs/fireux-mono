#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

process.on('unhandledRejection', (error) => {
  fail(friendlyError(error))
})

process.on('uncaughtException', (error) => {
  fail(friendlyError(error))
})

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const ENV_FILES = [
  '.env',
  'projects/misebox/misebox-app/.env',
  'projects/fireux/go-qr/.env',
]

loadEnvFiles(ENV_FILES)

const DEFAULT_APP_ID = 'la-tap-berne'
const DEFAULT_KITCHEN_SLUG = 'la-tapberne'
const DEFAULT_MENU_ID = 'main-copy'
const DEFAULT_MODEL =
  process.env.FIREUX_AI_MENU_EXTRACTION_MODEL ||
  'gpt-5.5'

const args = parseArgs(process.argv.slice(2))
const appId = text(args.app || DEFAULT_APP_ID)
const kitchenArg = text(args.kitchen || '')
const kitchenSlug = text(args.kitchenSlug || args['kitchen-slug'] || DEFAULT_KITCHEN_SLUG)
const menuId = normalizeSlug(args.menu || DEFAULT_MENU_ID)
const uploadId = normalizeSlug(args.upload || menuId)
const model = text(args.model || DEFAULT_MODEL)
const limit = numberValue(args.limit)
const commit = Boolean(args.commit)
const inspectOnly = Boolean(args.inspect)
const runId = text(args.run || args['run-id'] || buildRunId(uploadId))
const fromRunPath = text(args.fromRun || args['from-run'])

if (args.help || args.h) {
  printHelp()
  process.exit(0)
}

const rawServiceAccount = await readFile(SERVICE_ACCOUNT, 'utf8')
const firebaseApp = initializeApp({
  credential: cert(JSON.parse(rawServiceAccount)),
  projectId: PROJECT_ID,
})
const db = getFirestore(firebaseApp, DATABASE_ID)
const kitchenId = kitchenArg || await kitchenIdFromSlug(kitchenSlug)

if (!kitchenId) {
  fail(`Kitchen not found for slug "${kitchenSlug}". Pass --kitchen <id>.`)
}

const basePath = `apps/${appId}/kitchens/${kitchenId}`
const sourcePath = `${basePath}/menu-uploads/${uploadId}`
const sourceSnap = await db.doc(sourcePath).get()

if (!sourceSnap.exists) {
  fail(`Menu source upload not found: ${sourcePath}`)
}

const source = record({ ...sourceSnap.data(), id: sourceSnap.id })
const sourceFiles = fileRows(source)
const files = limit ? sourceFiles.slice(0, limit) : sourceFiles
const current = await readCurrentMenuShape(basePath, menuId)
const inspection = {
  appId,
  kitchenId,
  kitchenSlug,
  menuId,
  uploadId,
  runId,
  model,
  basePath,
  sourcePath,
  source: sourceSummary(source, sourceFiles),
  current: currentSummary(current),
  commit,
  inspectOnly,
  fromRunPath,
}

if (inspectOnly) {
  console.log(JSON.stringify(inspection, null, 2))
  process.exit(0)
}

if (!fromRunPath && !process.env.FIREUX_AI_API_KEY) {
  fail('FIREUX_AI_API_KEY is missing. Export it before running AI extraction.')
}

const extraction = fromRunPath
  ? await extractionFromLocalRun(fromRunPath)
  : await extractMenuFilesWithOpenAi({
      appId,
      menuId,
      model,
      files,
    })
const extractedSections = extraction.ok
  ? normalizeExtractedSections(extraction.data)
  : []
const extractedStatus = extraction.ok
  ? extractedSections.length
    ? 'complete'
    : 'empty'
  : 'failed'
const itemCount = current.sections.reduce(
  (count, section) => count + section.items.length,
  0
)
const extractedComparison = extractedStatus === 'complete'
  ? compareExtractedToCurrent(current, extractedSections)
  : {
      flags: [],
      counts: {
        extracted_sections: extractedSections.length,
        extracted_items: 0,
      },
    }
const flags = [
  {
    code: 'source-files-ready',
    level: 'info',
    message: `${files.length} source file(s) ready for extraction.`,
  },
  {
    code: 'menu-baseline',
    level: current.menu.status === 'missing' ? 'warning' : 'info',
    message: `Current menu status is ${current.menu.status || 'unknown'}.`,
  },
  ...(!extraction.ok
    ? [
        {
          code: 'ai-extraction-failed',
          level: 'error',
          message: extraction.reason || 'AI extraction failed.',
        },
      ]
    : []),
  ...(extraction.ok && !extractedSections.length
    ? [
        {
          code: 'ai-extraction-empty',
          level: 'warning',
          message: 'AI extraction returned no sections.',
        },
      ]
    : []),
  ...extraction.files
    .filter((file) => file.status === 'failed')
    .map((file) => ({
      code: 'ai-file-extraction-failed',
      level: 'warning',
      message: `${file.file_name || file.id} was not processed: ${file.reason || 'AI extraction failed for this file.'}`,
      item: file.file_name || file.id,
    })),
  ...extractedComparison.flags,
]
const run = {
  id: runId,
  mode: fromRunPath ? 'workspace-compare-run' : 'workspace-ai-dry-run',
  status: extractedStatus,
  app_id: appId,
  kitchen_id: kitchenId,
  menu_id: menuId,
  upload_id: uploadId,
  created_at: new Date().toISOString(),
  created_by: 'workspace:process-kitchen-menu-extraction',
  source: {
    id: sourceSnap.id,
    status: text(source.status),
    file_kind: text(source.file_kind) || 'document',
    files_total_count: sourceFiles.length,
    files_count: files.length,
    files,
  },
  current,
  extracted: {
    status: extractedStatus,
    provider: extraction.provider,
    model: extraction.model,
    reason: extraction.ok ? undefined : extraction.reason,
    files: extraction.files,
    sections: extractedSections,
    notes: Array.isArray(record(extraction.data).notes)
      ? record(extraction.data).notes.map(text).filter(Boolean)
      : [],
  },
  comparison: {
    can_compare: extractedStatus === 'complete' && current.menu.status !== 'missing',
    flags,
    counts: {
      source_files: files.length,
      current_sections: current.sections.length,
      current_items: itemCount,
      ...extractedComparison.counts,
    },
  },
}

await writeLocalRun(run)

if (commit) {
  const runPath = `${sourcePath}/extractions/${runId}`
  await db.doc(runPath).set(run, { merge: false })
  console.log(JSON.stringify({ saved: true, runPath, run }, null, 2))
} else {
  console.log(JSON.stringify({ saved: false, run }, null, 2))
}

function parseArgs(values) {
  const parsed = {}

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (!value.startsWith('--')) continue
    const key = value.slice(2)
    const next = values[index + 1]
    if (!next || next.startsWith('--')) {
      parsed[key] = true
      continue
    }
    parsed[key] = next
    index += 1
  }

  return parsed
}

function printHelp() {
  console.log(`Usage:
node temp/process-kitchen-menu-extraction.mjs [options]

Options:
  --app <appId>              Default: ${DEFAULT_APP_ID}
  --kitchen <kitchenId>      Kitchen document id. Overrides --kitchen-slug.
  --kitchen-slug <slug>      Default: ${DEFAULT_KITCHEN_SLUG}
  --menu <menuId>            Default: ${DEFAULT_MENU_ID}
  --upload <uploadId>        Default: same as --menu
  --limit <n>                Process only the first n files.
  --model <model>            Default: FIREUX_AI_MENU_EXTRACTION_MODEL/${DEFAULT_MODEL}
  --from-run <path>          Reuse a local extraction JSON and only compare.
  --inspect                  Read Firestore and print paths, no AI call.
  --commit                   Save run under menu-uploads/{uploadId}/extractions/{runId}.
	`)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

function friendlyError(error) {
  const message = error instanceof Error ? error.message : text(error)
  if (message.includes('firestore.googleapis.com')) {
    return `Firestore is unreachable from this shell: ${message}`
  }
  return message || 'Workspace menu extraction failed.'
}

function loadEnvFiles(files) {
  for (const file of files) {
    if (!existsSync(file)) continue
    const content = readFileSync(file, 'utf8')

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue

      const separator = line.indexOf('=')
      if (separator <= 0) continue

      const key = line.slice(0, separator).trim()
      const rawValue = line.slice(separator + 1).trim()
      if (!key || process.env[key] !== undefined) continue

      process.env[key] = rawValue
        .replace(/^['"]/, '')
        .replace(/['"]$/, '')
    }
  }
}

function text(value) {
  return String(value ?? '').trim()
}

function numberValue(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

function record(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
}

function normalizeSlug(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildRunId(value) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${normalizeSlug(value) || 'menu'}-${stamp}`
}

async function kitchenIdFromSlug(slug) {
  if (!slug) return ''
  const snap = await db
    .collection('kitchens')
    .where('slug', '==', slug)
    .limit(1)
    .get()

  return snap.docs[0]?.id || ''
}

function fileRows(source) {
  const files = Array.isArray(source.files) ? source.files.map(record) : []

  if (files.length) {
    return files.map((file, index) => ({
      id: text(file.id) || String(index + 1),
      file_name: text(file.file_name),
      file_type: text(file.file_type),
      file_kind: text(file.file_kind) || 'document',
      storage_path: text(file.storage_path),
      file_url: text(file.file_url),
      sort_order: numberValue(file.sort_order),
    }))
  }

  return text(source.storage_path)
    ? [
        {
          id: '1',
          file_name: text(source.file_name),
          file_type: text(source.file_type),
          file_kind: text(source.file_kind) || 'document',
          storage_path: text(source.storage_path),
          file_url: text(source.file_url),
          sort_order: 0,
        },
      ]
    : []
}

function sourceSummary(source, files) {
  return {
    id: text(source.id),
    status: text(source.status),
    file_kind: text(source.file_kind),
    files_count: files.length,
    file_names: files.map((file) => file.file_name),
  }
}

function currentSummary(current) {
  return {
    menu: current.menu,
    sections_count: current.sections.length,
    items_count: current.sections.reduce(
      (count, section) => count + section.items.length,
      0
    ),
  }
}

function row(data, id) {
  return {
    id: text(data.id) || id,
    name: text(data.name),
    description: text(data.description),
    status: text(data.status),
    kitchen_id: text(data.kitchen_id),
  }
}

async function readCurrentMenuShape(basePath, selectedMenuId) {
  const menuRef = db.doc(`${basePath}/menus/${selectedMenuId}`)
  const menuSnap = await menuRef.get()

  if (!menuSnap.exists) {
    return {
      menu: row({ status: 'missing' }, selectedMenuId),
      sections: [],
    }
  }

  const dishesSnap = await db.collection(`${basePath}/dishes`).get()
  const dishesById = new Map(
    dishesSnap.docs.map((doc) => [doc.id, record({ ...doc.data(), id: doc.id })])
  )
  const sectionsSnap = await menuRef.collection('sections').get()
  const sections = await Promise.all(
    sectionsSnap.docs.map(async (sectionDoc) => {
      const section = sectionRow(sectionDoc.data(), sectionDoc.id)
      const itemsSnap = await sectionDoc.ref.collection('items').get()
      const items = itemsSnap.docs
        .map((itemDoc) => {
          const item = record({ ...itemDoc.data(), id: itemDoc.id })
          return itemRow(
            item,
            itemDoc.id,
            dishesById.get(text(item.dish_id)) || null
          )
        })
        .filter(active)
        .sort(sortByOrderThenLabel)

      return {
        ...section,
        items,
      }
    })
  )

  return {
    menu: row(menuSnap.data() || {}, menuSnap.id),
    sections: sections.filter(active).sort(sortByOrderThenLabel),
  }
}

function sectionRow(section, id) {
  return {
    id: text(section.id) || id,
    label: text(section.label),
    description: text(section.description),
    status: text(section.status),
    sort_order: numberValue(section.sort_order),
  }
}

function itemRow(item, id, dish) {
  return {
    id: text(item.id) || id,
    dish_id: text(item.dish_id),
    name: text(dish?.name),
    description: text(dish?.description),
    price: numberValue(item.price),
    price_options: Array.isArray(item.price_options) ? item.price_options : [],
    status: text(item.status),
    sort_order: numberValue(item.sort_order),
  }
}

function active(entry) {
  return entry.status !== 'archived'
}

function sortByOrderThenLabel(left, right) {
  return left.sort_order - right.sort_order
}

function normalizeKey(value) {
  return text(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function money(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const normalized = text(value)
    .replace(/chf/ig, '')
    .replace(/[,]/g, '.')
    .match(/\d+(?:\.\d+)?/)

  return normalized ? numberValue(normalized[0]) : 0
}

function normalizeExtractedSections(value) {
  const source = record(value)
  const sections = Array.isArray(source.sections) ? source.sections : []

  return sections
    .map((section) => {
      const data = record(section)
      const items = Array.isArray(data.items) ? data.items : []

      return {
        label: text(data.label),
        items: items
          .map((item) => {
            const data = record(item)
            return {
              name: text(data.name),
              description: text(data.description),
              price: money(data.price),
              price_options: Array.isArray(data.price_options)
                ? data.price_options
                : [],
              source_file_ids: Array.isArray(data.source_file_ids)
                ? data.source_file_ids.map(text).filter(Boolean)
                : [],
            }
          })
          .filter((item) => item.name),
      }
    })
    .filter((section) => section.label || section.items.length)
}

function flatCurrentItems(current) {
  return current.sections.flatMap((section) =>
    section.items.map((item) => ({
      key: normalizeKey(item.name),
      section: section.label,
      name: item.name,
      price: item.price,
    }))
  )
}

function flatExtractedItems(sections) {
  return sections.flatMap((section) =>
    section.items.map((item) => ({
      key: normalizeKey(item.name),
      section: section.label,
      name: item.name,
      price: item.price,
    }))
  )
}

function compareExtractedToCurrent(current, extractedSections) {
  const flags = []
  const currentItems = flatCurrentItems(current)
  const extractedItems = flatExtractedItems(extractedSections)
  const currentByKey = new Map(currentItems.map((item) => [item.key, item]))
  const extractedByKey = new Map(extractedItems.map((item) => [item.key, item]))

  for (const item of currentItems) {
    if (!item.key || extractedByKey.has(item.key)) continue
    flags.push({
      code: 'missing-in-extraction',
      level: 'warning',
      message: `${item.name} exists in the current menu but was not found by AI.`,
      item: item.name,
      section: item.section,
    })
  }

  for (const item of extractedItems) {
    if (!item.key || currentByKey.has(item.key)) continue
    flags.push({
      code: 'new-in-extraction',
      level: 'info',
      message: `${item.name} was found by AI but is not in the current menu.`,
      item: item.name,
      section: item.section,
    })
  }

  for (const item of currentItems) {
    const extracted = extractedByKey.get(item.key)
    if (!extracted || !item.price || !extracted.price) continue
    if (Math.abs(item.price - extracted.price) < 0.05) continue
    flags.push({
      code: 'price-diff',
      level: 'warning',
      message: `${item.name} price differs: current ${item.price}, AI ${extracted.price}.`,
      item: item.name,
      section: item.section,
    })
  }

  return {
    flags,
    counts: {
      extracted_sections: extractedSections.length,
      extracted_items: extractedItems.length,
    },
  }
}

async function extractMenuFilesWithOpenAi(input) {
  const files = input.files.filter((file) => text(file.file_url))
  const fileResults = []
  const sections = []
  const notes = []
  let provider = 'openai'
  let resolvedModel = input.model

  for (const file of files) {
    console.info('[workspace-menu-extraction] extracting file', {
      menuId: input.menuId,
      fileId: file.id,
      fileName: file.file_name,
      model: input.model,
    })

    const response = await callOpenAiJson(buildMenuPhotoRequest(input, file))
    resolvedModel = response.model || resolvedModel

    if (!response.ok) {
      fileResults.push({
        id: file.id,
        file_name: file.file_name,
        status: 'failed',
        reason: response.reason || 'AI extraction failed for this file.',
        sections_count: 0,
        items_count: 0,
      })
      continue
    }

    const fileSections = normalizeExtractedSections(response.data)
      .map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          source_file_ids: [file.id],
        })),
      }))
    const fileNotes = Array.isArray(record(response.data).notes)
      ? record(response.data).notes.map(text).filter(Boolean)
      : []
    sections.push(...fileSections)
    notes.push(...fileNotes)
    fileResults.push({
      id: file.id,
      file_name: file.file_name,
      status: fileSections.length ? 'complete' : 'empty',
      reason: fileSections.length
        ? undefined
        : fileNotes[0] || 'No visible menu items detected.',
      sections_count: fileSections.length,
      items_count: fileSections.reduce(
        (count, section) => count + section.items.length,
        0
      ),
    })
  }

  if (!fileResults.length) {
    return {
      ok: false,
      reason: 'No source files have downloadable URLs.',
      provider,
      model: resolvedModel,
      files: [],
    }
  }

  const completed = fileResults.filter((file) => file.status === 'complete')
  const failed = fileResults.filter((file) => file.status === 'failed')

  if (!completed.length && failed.length === fileResults.length) {
    return {
      ok: false,
      reason: 'AI extraction failed for every source file.',
      provider,
      model: resolvedModel,
      files: fileResults,
    }
  }

  return {
    ok: true,
    provider,
    model: resolvedModel,
    files: fileResults,
    data: {
      sections: mergeSections(sections),
      notes: notes.length ? notes : ['no visible menu items'],
    },
  }
}

async function extractionFromLocalRun(path) {
  const parsed = JSON.parse(await readFile(path, 'utf8'))
  const run = record(parsed.run || parsed)
  const extracted = record(run.extracted)
  const status = text(extracted.status)

  return {
    ok: status !== 'failed',
    reason: text(extracted.reason),
    provider: text(extracted.provider) || 'local-run',
    model: text(extracted.model),
    files: Array.isArray(extracted.files) ? extracted.files.map(record) : [],
    data: {
      sections: Array.isArray(extracted.sections) ? extracted.sections : [],
      notes: Array.isArray(extracted.notes)
        ? extracted.notes.map(text).filter(Boolean)
        : [],
    },
  }
}

function buildMenuPhotoRequest(input, file) {
  return {
    model: input.model,
    input: [
      {
        role: 'system',
        content:
          'You are a FireUX server-side AI adapter. Complete the requested whitelisted task. Return only the requested result. When JSON is requested, return a single valid JSON object and no prose.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify({
              task: 'extract_structured_data',
              input: {
                images: [
                  {
                    id: file.id,
                    file_name: file.file_name,
                    url: file.file_url,
                    detail: 'high',
                  },
                ],
                imageDetail: 'high',
                instruction:
                  `Classify this uploaded restaurant menu photo, then extract only the visible menu dishes from this one image. Use source_file_ids ["${file.id}"] for every item. Covers, QR codes, contact pages, empty pages, and non-dish pages are valid uploads; return {"sections":[],"notes":["no visible menu items"]} for those. Keep original section labels and dish names. Preserve mixed-language wording. Return prices as CHF numbers. If a dish has multiple sizes or variants, put them in price_options and keep the lowest displayed price in price. Do not invent dishes, sections, or prices.`,
              },
              context: {
                domain: 'restaurant_menu',
                menuId: input.menuId,
                sourceFileId: file.id,
                sourceFileName: file.file_name,
                sourceKind: 'menu_source_phone_photo',
                currency: 'CHF',
                languagePolicy:
                  'Treat the original menu as default mixed-language copy, not one source language.',
              },
              outputJsonSchema: menuExtractionJsonSchema(),
            }),
          },
          {
            type: 'input_image',
            image_url: file.file_url,
            detail: 'high',
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'fireux_ai_result',
        schema: menuExtractionJsonSchema(),
        strict: false,
      },
    },
  }
}

function menuExtractionJsonSchema() {
  return {
    type: 'object',
    properties: {
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  price_options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        price: { type: 'number' },
                      },
                      required: ['label', 'price'],
                    },
                  },
                  source_file_ids: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: [
                  'name',
                  'description',
                  'price',
                  'price_options',
                  'source_file_ids',
                ],
              },
            },
          },
          required: ['label', 'items'],
        },
      },
      notes: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['sections', 'notes'],
  }
}

async function callOpenAiJson(body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 180_000)

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FIREUX_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    })
    const payload = await response.json().catch(() => null)
    const model = payload?.model || body.model

    if (!response.ok) {
      return {
        ok: false,
        reason:
          payload?.error?.message ||
          `OpenAI request failed with status ${response.status}`,
        provider: 'openai',
        model,
      }
    }

    try {
      return {
        ok: true,
        data: parseJsonFromText(textFromOpenAiPayload(payload)),
        provider: 'openai',
        model,
      }
    } catch {
      return {
        ok: false,
        reason: 'AI provider returned text that was not valid JSON.',
        provider: 'openai',
        model,
      }
    }
  } catch (error) {
    return {
      ok: false,
      reason: controller.signal.aborted
        ? 'OpenAI request timed out.'
        : error instanceof Error
          ? error.message
          : 'OpenAI request failed.',
      provider: 'openai',
      model: body.model,
    }
  } finally {
    clearTimeout(timeout)
  }
}

function textFromOpenAiPayload(payload) {
  if (text(payload?.output_text)) return text(payload.output_text)

  const output = Array.isArray(payload?.output) ? payload.output : []
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : []
    for (const part of content) {
      const value = text(part?.text || part?.content)
      if (value) return value
    }
  }

  return ''
}

function parseJsonFromText(value) {
  const stripped = text(value)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const candidates = [stripped]
  const firstObject = stripped.indexOf('{')
  const lastObject = stripped.lastIndexOf('}')

  if (firstObject >= 0 && lastObject > firstObject) {
    candidates.push(stripped.slice(firstObject, lastObject + 1))
  }

  for (const candidate of Array.from(new Set(candidates.filter(Boolean)))) {
    try {
      return JSON.parse(candidate)
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error('Invalid JSON')
}

function mergeSections(sections) {
  const byLabel = new Map()

  for (const section of sections) {
    const key = normalizeKey(section.label) || `section-${byLabel.size + 1}`
    const existing = byLabel.get(key)

    if (existing) {
      existing.items.push(...section.items)
      continue
    }

    byLabel.set(key, {
      label: section.label,
      items: [...section.items],
    })
  }

  return Array.from(byLabel.values())
}

async function writeLocalRun(run) {
  const dir = join('temp', 'menu-extraction-runs')
  await mkdir(dir, { recursive: true })
  await writeFile(
    join(dir, `${run.id}.json`),
    `${JSON.stringify(run, null, 2)}\n`
  )
}
