#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createSign } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from '../_lib/args.mjs'

const CORE_LANGUAGE_CODES = [
  'en',
  'de',
  'fr',
  'it',
  'es',
  'pt',
  'ar',
  'zh-CN',
  'ko',
  'ja',
]

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const COLLECTION_PATH = 'ingredients'
const SKIPPED_INGREDIENT_IDS = new Set(['tomato-sauce'])
const SYSTEM_ACTOR = 'system:codex-ingredient-translation-backfill'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/cloud-translation'

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = String(args.project || process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID)
const databaseId = typeof args.database === 'string' ? args.database.trim() : ''
const serviceAccountPath =
  typeof args['service-account'] === 'string'
    ? args['service-account'].trim()
    : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
const limit = args.limit ? Number(args.limit) : null
const pageSize = Math.min(Number(args.pageSize || 250), 500)
const onlyId = typeof args.only === 'string' ? args.only.trim() : ''

let cachedToken = null

const normalizeString = (value) => String(value ?? '').trim()
const normalizeLanguageCode = (value) => normalizeString(value).replace(/_/g, '-')

const encodeBase64Url = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

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

async function readServiceAccount(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    return JSON.parse(await readFile(candidate, 'utf8'))
  }

  throw new Error(`Service account file not found: ${pathValue}`)
}

function getServiceAccountField(account, snake, camel) {
  return normalizeString(account[snake] || account[camel])
}

async function getGoogleAccessToken(account) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const clientEmail = getServiceAccountField(account, 'client_email', 'clientEmail')
  const privateKey = getServiceAccountField(account, 'private_key', 'privateKey')

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google service-account client email or private key')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: TOKEN_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  )
  const unsignedToken = `${header}.${claim}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedToken)
  signer.end()
  const signature = encodeBase64Url(signer.sign(privateKey.replace(/\\n/g, '\n')))
  const assertion = `${unsignedToken}.${signature}`

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const tokenData = await tokenResponse.json().catch(() => ({}))

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(
      tokenData.error_description || tokenData.error || 'Google auth failed'
    )
  }

  cachedToken = {
    token: tokenData.access_token,
    expiresAt:
      Date.now() + Math.max(Number(tokenData.expires_in || 3600) - 60, 60) * 1000,
  }

  return cachedToken.token
}

async function translateBatch(account, { texts, from, to }) {
  const projectId = getServiceAccountField(account, 'project_id', 'projectId')
  const token = await getGoogleAccessToken(account)
  const response = await fetch(
    `https://translation.googleapis.com/v3/projects/${encodeURIComponent(
      projectId
    )}:translateText`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: texts,
        mimeType: 'text/plain',
        sourceLanguageCode: from,
        targetLanguageCode: to,
      }),
    }
  )
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error?.message || data.error?.status || 'Google Translate failed')
  }

  return (data.translations || []).map((entry) =>
    normalizeString(entry?.translatedText)
  )
}

function normalizeTextMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const map = {}
  for (const [language, entry] of Object.entries(value)) {
    const code = normalizeLanguageCode(language)
    const text = normalizeString(entry)
    if (code && text) map[code] = text
  }
  return map
}

function mapsEqual(left, right) {
  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()
  if (leftKeys.length !== rightKeys.length) return false
  return leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key])
}

function resolveSourceLanguage(data, names) {
  return (
    normalizeLanguageCode(data.source_language) ||
    normalizeLanguageCode(data.default_locale) ||
    (names.en ? 'en' : 'en')
  )
}

function buildPlan(docSnap) {
  const data = docSnap.data() || {}

  if (SKIPPED_INGREDIENT_IDS.has(docSnap.id)) {
    return {
      docSnap,
      data,
      skipped: true,
      cleanupCandidate: true,
      reason: 'not a root ingredient canon item',
    }
  }

  const names = normalizeTextMap(data.names)
  const sourceLanguage = resolveSourceLanguage(data, names)
  const sourceText = normalizeString(names[sourceLanguage] || data.name)

  if (!sourceText) {
    return {
      docSnap,
      data,
      skipped: true,
      reason: 'missing source text',
    }
  }

  const nextNames = { ...names, [sourceLanguage]: sourceText }

  const missingLanguages = CORE_LANGUAGE_CODES.filter((language) => !nextNames[language])
  const missingId = !normalizeString(data.id)
  const idMismatch = Boolean(normalizeString(data.id) && normalizeString(data.id) !== docSnap.id)
  const needsSourceLanguage = normalizeLanguageCode(data.source_language) !== sourceLanguage
  const needsNames = missingLanguages.length > 0 || !mapsEqual(names, nextNames)
  const hasNamesStatus = Object.prototype.hasOwnProperty.call(data, 'names_status')
  const needsUpdate = missingId || needsSourceLanguage || needsNames || hasNamesStatus

  return {
    docSnap,
    data,
    id: docSnap.id,
    name: normalizeString(data.name),
    sourceLanguage,
    sourceText,
    nextNames,
    missingLanguages,
    missingId,
    idMismatch,
    hasNamesStatus,
    needsUpdate,
    failedLanguages: [],
  }
}

async function collectPlans(db) {
  if (onlyId) {
    const docSnap = await db.collection(COLLECTION_PATH).doc(onlyId).get()
    return docSnap.exists ? [buildPlan(docSnap)] : []
  }

  const plans = []
  let lastDoc = null

  while (true) {
    if (limit && plans.length >= limit) break
    let query = db.collection(COLLECTION_PATH).orderBy('__name__').limit(pageSize)
    if (lastDoc) query = query.startAfter(lastDoc)

    const snap = await query.get()
    if (snap.empty) break

    for (const docSnap of snap.docs) {
      if (limit && plans.length >= limit) break
      plans.push(buildPlan(docSnap))
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  return plans
}

function groupTranslationJobs(plans) {
  const groups = new Map()

  for (const plan of plans) {
    if (plan.skipped || !plan.needsUpdate) continue

    for (const language of plan.missingLanguages) {
      const key = `${plan.sourceLanguage}=>${language}`
      if (!groups.has(key)) {
        groups.set(key, {
          from: plan.sourceLanguage,
          to: language,
          entries: [],
        })
      }

      groups.get(key).entries.push(plan)
    }
  }

  return [...groups.values()]
}

async function fillTranslations(account, plans) {
  const groups = groupTranslationJobs(plans)

  for (const group of groups) {
    const texts = group.entries.map((plan) => plan.sourceText)
    console.log('[translate]', {
      from: group.from,
      to: group.to,
      count: texts.length,
    })

    try {
      const translated = await translateBatch(account, {
        texts,
        from: group.from,
        to: group.to,
      })

      group.entries.forEach((plan, index) => {
        const text = normalizeString(translated[index])
        if (!text) {
          plan.failedLanguages.push(group.to)
          return
        }

        plan.nextNames[group.to] = text
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[translate failed]', {
        from: group.from,
        to: group.to,
        count: texts.length,
        message,
      })
      group.entries.forEach((plan) => plan.failedLanguages.push(group.to))
    }
  }
}

function buildPatch(plan) {
  const patch = {
    source_language: plan.sourceLanguage,
    names: plan.nextNames,
    updated: {
      ...(plan.data.updated && typeof plan.data.updated === 'object'
        ? plan.data.updated
        : {}),
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }

  if (plan.missingId) patch.id = plan.id
  if (plan.hasNamesStatus) patch.names_status = FieldValue.delete()

  return patch
}

async function commitPlans(plans) {
  let batch = db.batch()
  let batchOps = 0
  let written = 0

  for (const plan of plans) {
    if (plan.skipped || !plan.needsUpdate) continue

    const patch = buildPatch(plan)
    batch.set(plan.docSnap.ref, patch, { merge: true })
    batchOps += 1
    written += 1

    if (batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (batchOps > 0) await batch.commit()
  return written
}

function reportPlans(plans) {
  const skipped = plans.filter((plan) => plan.skipped)
  const cleanupCandidates = skipped.filter((plan) => plan.cleanupCandidate)
  const needingUpdate = plans.filter((plan) => !plan.skipped && plan.needsUpdate)
  const complete = plans.filter((plan) => !plan.skipped && !plan.needsUpdate)
  const idMismatches = plans.filter((plan) => !plan.skipped && plan.idMismatch)
  const translationJobs = groupTranslationJobs(plans)
  const requestedTranslations = translationJobs.reduce(
    (total, group) => total + group.entries.length,
    0
  )

  console.log('[ingredients translations] plan', {
    projectId,
    databaseId: databaseId || '(default)',
    collection: COLLECTION_PATH,
    commit,
    inspected: plans.length,
    complete: complete.length,
    needingUpdate: needingUpdate.length,
    skipped: skipped.length,
    cleanupCandidates: cleanupCandidates.length,
    translationGroups: translationJobs.length,
    requestedTranslations,
  })

  if (idMismatches.length) {
    console.log('[id-mismatch][left unchanged]', idMismatches.map((plan) => ({
      path: plan.docSnap.ref.path,
      currentId: normalizeString(plan.data.id),
      docId: plan.id,
    })))
  }

  for (const plan of needingUpdate) {
    console.log('[plan]', {
      path: plan.docSnap.ref.path,
      name: plan.name,
      sourceLanguage: plan.sourceLanguage,
      missingId: plan.missingId,
      removesNamesStatus: plan.hasNamesStatus,
      missingLanguages: plan.missingLanguages,
    })
  }

  for (const plan of skipped) {
    console.log('[skip]', {
      path: plan.docSnap.ref.path,
      reason: plan.reason,
    })
  }
}

const serviceAccount = await readServiceAccount(serviceAccountPath)
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId,
})
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

console.log('[ingredients translations] start', {
  projectId,
  databaseId: databaseId || '(default)',
  commit,
  limit,
  only: onlyId || '(all)',
})

const plans = await collectPlans(db)
reportPlans(plans)

if (!commit) {
  console.log('[ingredients translations] dry-run only. Re-run with --commit to translate and write.')
  process.exit(0)
}

await fillTranslations(serviceAccount, plans)
const written = await commitPlans(plans)
const failures = plans
  .filter((plan) => plan.failedLanguages?.length)
  .map((plan) => ({
    path: plan.docSnap.ref.path,
    failedLanguages: plan.failedLanguages,
  }))

console.log('[ingredients translations] committed', {
  written,
  failures: failures.length,
})

if (failures.length) {
  console.log('[ingredients translations] failures', failures)
}
