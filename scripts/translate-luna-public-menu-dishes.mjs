#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createSign } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const MENU_IDS = ['main', 'pizza']
const SOURCE_LANGUAGE = 'de'
const TARGET_LANGUAGE_CODES = ['en', 'fr', 'it']
const ALL_LANGUAGE_CODES = [SOURCE_LANGUAGE, ...TARGET_LANGUAGE_CODES]
const SYSTEM_ACTOR = 'system:translate-luna-public-menu-dishes'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/cloud-translation'
const TRANSLATE_CHUNK_SIZE = 40

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

  const data = JSON.parse(await readFile(resolvedPath, 'utf8'))
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account: data, resolvedPath }
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
    throw new Error(tokenData.error_description || tokenData.error || 'Google auth failed')
  }

  cachedToken = {
    token: tokenData.access_token,
    expiresAt:
      Date.now() + Math.max(Number(tokenData.expires_in || 3600) - 60, 60) * 1000,
  }

  return cachedToken.token
}

async function translateBatch(account, { texts, to }) {
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
        sourceLanguageCode: SOURCE_LANGUAGE,
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

function chunk(values, size) {
  const chunks = []
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }
  return chunks
}

function menuDishIds(menuDocs) {
  const ids = []
  const seen = new Set()

  for (const menuDoc of menuDocs) {
    const data = menuDoc.data() || {}
    const sections = Array.isArray(data.sections) ? data.sections : []
    for (const section of sections) {
      const items = Array.isArray(section?.items) ? section.items : []
      for (const item of items) {
        const dishId = normalizeString(item?.dish_id)
        if (!dishId || seen.has(dishId)) continue
        seen.add(dishId)
        ids.push(dishId)
      }
    }
  }

  return ids
}

function buildPlan(docSnap) {
  const data = docSnap.data() || {}
  const sourceName = normalizeString(data.name || data.names?.[SOURCE_LANGUAGE])
  const descriptions = normalizeTextMap(data.descriptions)
  const sourceDescription = normalizeString(
    descriptions[SOURCE_LANGUAGE] || data.description
  )

  const nextNames = Object.fromEntries(
    ALL_LANGUAGE_CODES.map((language) => [language, sourceName])
  )
  const nextDescriptions = sourceDescription
    ? { ...descriptions, [SOURCE_LANGUAGE]: sourceDescription }
    : {}

  return {
    docSnap,
    id: docSnap.id,
    sourceName,
    sourceDescription,
    nextNames,
    nextDescriptions,
    missingDescriptionLanguages: sourceDescription
      ? TARGET_LANGUAGE_CODES.filter((language) => !nextDescriptions[language])
      : [],
    failedLanguages: [],
  }
}

async function fillDescriptionTranslations(account, plans) {
  for (const language of TARGET_LANGUAGE_CODES) {
    const entries = plans.filter(
      (plan) => plan.sourceDescription && !plan.nextDescriptions[language]
    )
    if (!entries.length) continue

    console.log('[translate]', { from: SOURCE_LANGUAGE, to: language, count: entries.length })

    for (const group of chunk(entries, TRANSLATE_CHUNK_SIZE)) {
      try {
        const translated = await translateBatch(account, {
          texts: group.map((plan) => plan.sourceDescription),
          to: language,
        })

        group.forEach((plan, index) => {
          const text = normalizeString(translated[index])
          if (text) {
            plan.nextDescriptions[language] = text
          } else {
            plan.failedLanguages.push(language)
          }
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('[translate failed]', {
          from: SOURCE_LANGUAGE,
          to: language,
          count: group.length,
          message,
        })
        group.forEach((plan) => plan.failedLanguages.push(language))
      }
    }
  }
}

function buildPatch(plan) {
  const translated = TARGET_LANGUAGE_CODES.every((language) =>
    Boolean(plan.nextDescriptions[language])
  )

  return {
    source_language: SOURCE_LANGUAGE,
    names: plan.nextNames,
    descriptions: plan.nextDescriptions,
    translated,
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath } = await readServiceAccount(serviceAccountPath)
  const app = initializeApp(
    { credential: cert(account), projectId },
    'translate-luna-public-menu-dishes'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${LUNA_KITCHEN_ID}`)
  const menuDocs = await Promise.all(
    MENU_IDS.map((menuId) => kitchenRef.collection('menus').doc(menuId).get())
  )
  const dishIds = menuDishIds(menuDocs)
  const dishDocs = await Promise.all(
    dishIds.map((dishId) => kitchenRef.collection('dishes').doc(dishId).get())
  )
  const plans = dishDocs.filter((docSnap) => docSnap.exists).map(buildPlan)
  const missingDishDocs = dishIds.filter((dishId, index) => !dishDocs[index]?.exists)

  console.log('[luna dish translations] plan', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedPath,
    kitchenPath: kitchenRef.path,
    menuIds: MENU_IDS,
    dishIds: dishIds.length,
    existingDishes: plans.length,
    missingDishDocs,
    targetLanguages: TARGET_LANGUAGE_CODES,
    descriptionJobs: plans.reduce(
      (total, plan) => total + plan.missingDescriptionLanguages.length,
      0
    ),
  })

  if (!commit) {
    console.log('[luna dish translations] dry-run only. Re-run with --commit to write.')
    return
  }

  await fillDescriptionTranslations(account, plans)

  let batch = db.batch()
  let batchOps = 0
  let written = 0
  for (const plan of plans) {
    batch.set(plan.docSnap.ref, buildPatch(plan), { merge: true })
    batchOps += 1
    written += 1

    if (batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }
  if (batchOps > 0) await batch.commit()

  const failures = plans
    .filter((plan) => plan.failedLanguages.length)
    .map((plan) => ({
      path: plan.docSnap.ref.path,
      failedLanguages: plan.failedLanguages,
    }))

  console.log('[luna dish translations] committed', {
    written,
    failures,
  })
}

main().catch((error) => {
  console.error('[luna dish translations] failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
