import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = '/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono'
const fireuxServiceAccountPath = path.join(
  repoRoot,
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
)

if (!process.env.FIREBASE_SERVICE_ACCOUNT && fs.existsSync(fireuxServiceAccountPath)) {
  process.env.FIREBASE_SERVICE_ACCOUNT = fs.readFileSync(fireuxServiceAccountPath, 'utf8')
}

// Prefer explicit project id for the FireUX global ecosystem target.
if (!process.env.FIREBASE_PROJECT_ID) process.env.FIREBASE_PROJECT_ID = 'fireux-2005'

const { getAdminApp } = await import(
  path.join(repoRoot, 'packages/core/fireux-core/src/runtime/server/utils/getAdmin.ts')
)
const firestore = await import('firebase-admin/firestore')
const { getFirestore, FieldPath, Timestamp } = firestore

const db = getFirestore(getAdminApp())

const summary = {
  ecosystem: 'unknown',
  scanned: {},
  issues: 0,
}

const report = {
  summary,
  canon: {
    apps: {
      rules: [],
      inferredSchema: [],
      issues: [],
    },
    users: {
      rules: [],
      issues: [],
    },
    profiles: {
      rules: [],
      issues: [],
    },
  },
  inventory: {
    collections: [],
  },
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function detectEcosystemFromConfig() {
  const nuxtConfigPath = path.join(repoRoot, 'projects/fireux/fireux-app/nuxt.config.ts')
  const raw = readFileSafe(nuxtConfigPath)
  if (!raw) return 'unknown'
  const match = raw.match(/ecosystem:\s*'([^']+)'/)
  return match?.[1] || 'unknown'
}

summary.ecosystem = detectEcosystemFromConfig()

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Timestamp)
}

function valueType(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (value instanceof Timestamp) return 'timestamp'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number'
  if (typeof value === 'object') {
    const ctor = value?.constructor?.name
    if (ctor === 'GeoPoint') return 'geopoint'
    if (ctor === 'DocumentReference') return 'reference'
    if (ctor === 'Bytes') return 'bytes'
    return 'object'
  }
  return typeof value
}

function addIssue(bucket, issue) {
  bucket.push(issue)
  summary.issues += 1
}

function minimalExample(data, keys = []) {
  const out = {}
  for (const k of keys) {
    if (k.includes('.')) {
      const parts = k.split('.')
      let cur = data
      let ok = true
      for (const p of parts) {
        if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
          cur = cur[p]
        } else {
          ok = false
          break
        }
      }
      if (ok) out[k] = shrinkValue(cur)
      continue
    }
    if (Object.prototype.hasOwnProperty.call(data || {}, k)) out[k] = shrinkValue(data[k])
  }
  if (!Object.keys(out).length) {
    const fallbackKeys = Object.keys(data || {}).slice(0, 4)
    for (const k of fallbackKeys) out[k] = shrinkValue(data[k])
  }
  return out
}

function shrinkValue(value, depth = 0) {
  const t = valueType(value)
  if (t === 'timestamp') return value.toDate().toISOString()
  if (depth > 1) {
    if (t === 'object') return '{...}'
    if (t === 'array') return `[${value.length}]`
    return value
  }
  if (Array.isArray(value)) {
    return value.slice(0, 3).map((v) => shrinkValue(v, depth + 1))
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value).slice(0, 6).map(([k, v]) => [k, shrinkValue(v, depth + 1)])
    return Object.fromEntries(entries)
  }
  return value
}

async function countCollectionRef(colRef) {
  try {
    const agg = await colRef.count().get()
    const count = typeof agg?.data === 'function' ? agg.data().count : agg?.data?.count
    if (typeof count === 'number') return count
  } catch {
    // fallback below
  }
  let total = 0
  let last = null
  const pageSize = 500
  while (true) {
    let q = colRef.orderBy(FieldPath.documentId()).limit(pageSize)
    if (last) q = q.startAfter(last)
    const snap = await q.get()
    total += snap.size
    if (snap.size < pageSize) break
    last = snap.docs[snap.docs.length - 1]
  }
  return total
}

async function scanCollectionPath(collectionPath, onDoc, { pageSize = 500 } = {}) {
  let last = null
  let total = 0
  while (true) {
    let q = db.collection(collectionPath).orderBy(FieldPath.documentId()).limit(pageSize)
    if (last) q = q.startAfter(last)
    const snap = await q.get()
    for (const doc of snap.docs) {
      total += 1
      await onDoc(doc)
    }
    if (snap.size < pageSize) break
    last = snap.docs[snap.docs.length - 1]
  }
  return total
}

function setScanned(key, count) {
  summary.scanned[key] = (summary.scanned[key] || 0) + count
}

function flattenSchemaTypes(obj, prefix, outMap) {
  if (!isPlainObject(obj)) return
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key
    if (!outMap.has(fieldPath)) outMap.set(fieldPath, new Map())
    const type = valueType(value)
    const typeMap = outMap.get(fieldPath)
    typeMap.set(type, (typeMap.get(type) || 0) + 1)

    if (Array.isArray(value)) {
      const elTypes = new Map()
      for (const el of value.slice(0, 20)) {
        const et = valueType(el)
        elTypes.set(et, (elTypes.get(et) || 0) + 1)
        if (isPlainObject(el)) flattenSchemaTypes(el, `${fieldPath}[]`, outMap)
      }
      if (elTypes.size) {
        const pathEl = `${fieldPath}[]`
        if (!outMap.has(pathEl)) outMap.set(pathEl, new Map())
        const elMap = outMap.get(pathEl)
        for (const [t, c] of elTypes.entries()) elMap.set(t, (elMap.get(t) || 0) + c)
      }
      continue
    }

    if (isPlainObject(value)) flattenSchemaTypes(value, fieldPath, outMap)
  }
}

function walk(value, visitor, ctx = { path: [] }) {
  visitor(value, ctx.path)
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, visitor, { path: [...ctx.path, String(i)] }))
    return
  }
  if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) walk(v, visitor, { path: [...ctx.path, k] })
  }
}

function nonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

function hasKey(obj, key) {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key)
}

function getByPath(obj, dotted) {
  return dotted.split('.').reduce((acc, key) => (acc && hasKey(acc, key) ? acc[key] : undefined), obj)
}

function isGooglePlaceIconUrl(v) {
  return (
    typeof v === 'string' &&
    /(?:maps\.)?gstatic\.com\/mapfiles\/place_api|googleapis\.com\/maps\/api\/place|googleusercontent\.com/i.test(v)
  )
}

function topLabelCollectionFromPath(docPath) {
  return docPath.split('/').length > 1 ? docPath.split('/').slice(0, 2).join('/') : docPath
}

// ---------- Code-derived canon references ----------
const userCodeEvidence = [
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch.ts',
].filter((p) => fs.existsSync(path.join(repoRoot, p)))

const profileConfigFiles = [
  'packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/supporting.ts',
  'packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/supporting.ts',
  'packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/supporting.ts',
  'packages/extensions/fireux-drop/src/runtime/models/profiles/Supplier/supporting.ts',
  'packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/supporting.ts',
  'packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/supporting.ts',
].filter((p) => fs.existsSync(path.join(repoRoot, p)))

const profileCollections = new Set()
for (const rel of profileConfigFiles) {
  const raw = readFileSafe(path.join(repoRoot, rel)) || ''
  for (const m of raw.matchAll(/collectionName:\s*'([^']+)'/g)) profileCollections.add(m[1])
}
const canonicalProfileCollections = [...profileCollections].sort()

report.canon.apps.rules = [
  'A1 doc.id is canonical app id; stored `id` field is non-canonical (flagged).',
  'A2 required: role∈[global,tenant], ecosystem, app_name, app_short_name as non-empty strings.',
  'A3 `admin_ids` should be an array of strings; missing is warn.',
  'A4 `media` should be object; URL-like leaves under media should be strings.',
  'A5 `derived.user_count` must be non-negative integer when present.',
  'A6 `join_requests` must be array when present.',
  'A7 flag obvious type drift on common app fields (e.g., description object/string drift).',
]
report.canon.users.rules = [
  `B1 code search indicates canonical core users collection is \`users\` with app membership overlays at \`apps/{appId}/users\` (evidence: ${userCodeEvidence.join(', ') || 'n/a'}).`,
  'B2 user doc canon id is Firebase Auth uid (doc.id); overlay user docs under apps also keyed by uid.',
  'B3 root user should have non-empty `display_name` or `name` (warn if missing).',
  'B4 duplicated `uid`/`id` fields that equal doc.id are flagged as canon drift; mismatches are errors.',
  'B5 app membership references in user docs should use app doc.id (`app_id`/string ids), not nested `id` fields in app-ref objects.',
]
report.canon.profiles.rules = [
  `C1 code-derived profile collections: ${canonicalProfileCollections.join(', ') || 'none found'} (from model supporting files under models/profiles).`,
  'C2 shared ensure/create flows use doc paths `<collection>/<uid>` and `apps/<appId>/<collection>/<uid>`, so these profile families are treated as 1:1 with user uid.',
  'C3 `place_id`/`placeId` must be string; flag `place_image`/`placeImage` values that look like Google icon URLs.',
  'C4 missing human-readable profile labels (title/name/display_name) are warnings only unless shape clearly breaks reads.',
]

// ---------- Apps audit ----------
const appIds = new Set()
const appSchemaMap = new Map()

if ((await db.listCollections()).some((c) => c.id === 'apps')) {
  const appsCount = await countCollectionRef(db.collection('apps'))
  setScanned('apps', appsCount)

  await scanCollectionPath('apps', async (doc) => {
    const data = doc.data() || {}
    const docPath = `apps/${doc.id}`
    appIds.add(doc.id)
    flattenSchemaTypes(data, '', appSchemaMap)

    if (hasKey(data, 'id')) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'error',
        rule: 'A1.app-id-duplicated',
        message:
          typeof data.id === 'string' && data.id === doc.id
            ? 'Stored `id` duplicates canonical app doc.id.'
            : 'Stored `id` exists and does not match canonical app doc.id.',
        example: minimalExample(data, ['id', 'app_name', 'ecosystem']),
      })
    }

    if (!['global', 'tenant'].includes(String(data.role ?? ''))) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'error',
        rule: 'A2.role-required',
        message: 'App `role` must be `global` or `tenant`.',
        example: minimalExample(data, ['role', 'app_name', 'ecosystem']),
      })
    }

    for (const field of ['ecosystem', 'app_name', 'app_short_name']) {
      if (!nonEmptyString(data[field])) {
        addIssue(report.canon.apps.issues, {
          collection: 'apps',
          docPath,
          severity: 'error',
          rule: `A2.${field}-required`,
          message: 'App `'+ field + '` must be a non-empty string.',
          example: minimalExample(data, [field, 'role']),
        })
      }
    }

    if (!hasKey(data, 'admin_ids')) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'warn',
        rule: 'A3.admin_ids-missing',
        message: '`admin_ids` missing (allowed for test/dev, but canonical shape expects array).',
        example: minimalExample(data, ['app_name', 'role']),
      })
    } else if (!Array.isArray(data.admin_ids)) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'error',
        rule: 'A3.admin_ids-type',
        message: '`admin_ids` must be an array of strings.',
        example: minimalExample(data, ['admin_ids', 'app_name']),
      })
    } else if (data.admin_ids.some((v) => typeof v !== 'string')) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'error',
        rule: 'A3.admin_ids-elements',
        message: '`admin_ids` contains non-string entries.',
        example: minimalExample(data, ['admin_ids', 'app_name']),
      })
    }

    if (!hasKey(data, 'media') || !isPlainObject(data.media)) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'error',
        rule: 'A4.media-object',
        message: '`media` must be an object.',
        example: minimalExample(data, ['media', 'app_name']),
      })
    } else {
      walk(data.media, (value, pathParts) => {
        if (!pathParts.length) return
        const leafKey = pathParts[pathParts.length - 1]
        const leafPath = pathParts.join('.')
        const t = valueType(value)
        if (['url', 'image', 'icon', 'logo', 'cover', 'thumbnail', 'wordmark', 'avatar'].some((s) => leafKey.toLowerCase().includes(s))) {
          if (!(typeof value === 'string')) {
            addIssue(report.canon.apps.issues, {
              collection: 'apps',
              docPath,
              severity: 'error',
              rule: 'A4.media-url-type',
              message: `media.${leafPath} should be a string URL (empty string allowed).`,
              example: { [`media.${leafPath}`]: shrinkValue(value), app_name: data.app_name || '' },
            })
          }
        } else if (!['string', 'object', 'array', 'boolean', 'integer', 'number', 'null', 'timestamp'].includes(t)) {
          addIssue(report.canon.apps.issues, {
            collection: 'apps',
            docPath,
            severity: 'warn',
            rule: 'A7.media-type-drift',
            message: `Unexpected media leaf type at media.${leafPath}: ${t}.`,
            example: { [`media.${leafPath}`]: shrinkValue(value) },
          })
        }
      })
    }

    if (hasKey(data, 'derived') && !isPlainObject(data.derived)) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'warn',
        rule: 'A7.derived-type',
        message: '`derived` should be an object when present.',
        example: minimalExample(data, ['derived', 'app_name']),
      })
    }

    const userCount = getByPath(data, 'derived.user_count')
    if (userCount !== undefined && !(Number.isInteger(userCount) && userCount >= 0)) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'error',
        rule: 'A5.derived.user_count',
        message: '`derived.user_count` must be a non-negative integer when present.',
        example: minimalExample(data, ['derived.user_count', 'app_name']),
      })
    }

    if (hasKey(data, 'join_requests') && !Array.isArray(data.join_requests)) {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'error',
        rule: 'A6.join_requests-type',
        message: '`join_requests` must be an array when present.',
        example: minimalExample(data, ['join_requests', 'app_name']),
      })
    }

    if (hasKey(data, 'description') && typeof data.description !== 'string') {
      addIssue(report.canon.apps.issues, {
        collection: 'apps',
        docPath,
        severity: 'warn',
        rule: 'A7.description-type-drift',
        message: '`description` should be a string; observed type drift.',
        example: minimalExample(data, ['description', 'app_name']),
      })
    }
  })
}

report.canon.apps.inferredSchema = [...appSchemaMap.entries()]
  .map(([field, typeCounts]) => ({
    field,
    types: [...typeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([type]) => type),
    counts: Object.fromEntries([...typeCounts.entries()].sort((a, b) => b[1] - a[1])),
  }))
  .sort((a, b) => a.field.localeCompare(b.field))

// ---------- Users audit ----------
const rootUsersExists = (await db.listCollections()).some((c) => c.id === 'users')
if (rootUsersExists) {
  const usersCount = await countCollectionRef(db.collection('users'))
  setScanned('users', usersCount)
}

function auditCanonicalIdFields({ bucket, collection, docPath, docId, data, rulePrefix }) {
  if (hasKey(data, 'uid')) {
    if (typeof data.uid !== 'string') {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'error',
        rule: `${rulePrefix}.uid-type`,
        message: '`uid` field must be a string when present.',
        example: minimalExample(data, ['uid', 'id']),
      })
    } else if (data.uid !== docId) {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'error',
        rule: `${rulePrefix}.uid-mismatch`,
        message: '`uid` does not match canonical doc.id.',
        example: minimalExample(data, ['uid', 'id']),
      })
    } else {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'warn',
        rule: `${rulePrefix}.uid-duplicate`,
        message: 'Stored `uid` duplicates canonical doc.id.',
        example: minimalExample(data, ['uid']),
      })
    }
  }

  if (hasKey(data, 'id')) {
    if (typeof data.id !== 'string') {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'error',
        rule: `${rulePrefix}.id-type`,
        message: '`id` field must be a string when present.',
        example: minimalExample(data, ['id', 'uid']),
      })
    } else if (data.id !== docId) {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'error',
        rule: `${rulePrefix}.id-mismatch`,
        message: 'Stored `id` does not match canonical doc.id.',
        example: minimalExample(data, ['id', 'uid']),
      })
    } else {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'warn',
        rule: `${rulePrefix}.id-duplicate`,
        message: 'Stored `id` duplicates canonical doc.id.',
        example: minimalExample(data, ['id']),
      })
    }
  }
}

function auditUserAppMembershipRefs(data, docPath, collection, bucket) {
  const seenWarnKeys = new Set()

  function emitOnce(rule, message, example) {
    const key = `${rule}:${JSON.stringify(example)}`
    if (seenWarnKeys.has(key)) return
    seenWarnKeys.add(key)
    addIssue(bucket, { collection, docPath, severity: 'warn', rule, message, example })
  }

  walk(data, (value, pathParts) => {
    const key = pathParts[pathParts.length - 1] || ''
    const pathStr = pathParts.join('.')

    if (key === 'app_id' || key === 'appId') {
      if (typeof value !== 'string') {
        addIssue(bucket, {
          collection,
          docPath,
          severity: 'error',
          rule: 'B5.app-ref-id-type',
          message: `\`${pathStr}\` must be a string app doc.id reference.`,
          example: { [pathStr]: shrinkValue(value) },
        })
      } else if (appIds.size && !appIds.has(value)) {
        emitOnce(
          'B5.app-ref-id-unknown',
          `\`${pathStr}\` references app id not found in root apps collection.`,
          { [pathStr]: value }
        )
      }
      return
    }

    if (isPlainObject(value)) {
      const parentKey = key.toLowerCase()
      const looksAppRef = parentKey.includes('app') || pathStr.toLowerCase().includes('userof') || pathStr.toLowerCase().includes('adminof')
      if (looksAppRef && hasKey(value, 'id') && !hasKey(value, 'app_id') && !hasKey(value, 'appId')) {
        emitOnce(
          'B5.app-ref-uses-id-field',
          `App membership/reference object at \`${pathStr || '(root)'}\` uses nested \`id\` field instead of explicit app doc.id field.`,
          { [pathStr || '(root)']: shrinkValue(value) }
        )
      }
    }
  })

  for (const field of ['userOf', 'adminOf']) {
    const v = data?.[field]
    if (v === undefined) continue
    if (!Array.isArray(v)) {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'warn',
        rule: 'B5.membership-array-type',
        message: `\`${field}\` should be an array of app doc.id strings.`,
        example: minimalExample(data, [field]),
      })
      continue
    }
    const nonStrings = v.filter((x) => typeof x !== 'string')
    if (nonStrings.length) {
      addIssue(bucket, {
        collection,
        docPath,
        severity: 'warn',
        rule: 'B5.membership-elements-type',
        message: `\`${field}\` contains non-string entries.`,
        example: minimalExample(data, [field]),
      })
    }
    if (appIds.size) {
      const unknowns = v.filter((x) => typeof x === 'string' && !appIds.has(x)).slice(0, 3)
      if (unknowns.length) {
        addIssue(bucket, {
          collection,
          docPath,
          severity: 'warn',
          rule: 'B5.membership-unknown-app',
          message: `\`${field}\` contains app ids not found in root apps collection.`,
          example: { [field]: unknowns },
        })
      }
    }
  }
}

if (rootUsersExists) {
  await scanCollectionPath('users', async (doc) => {
    const data = doc.data() || {}
    const docPath = `users/${doc.id}`
    auditCanonicalIdFields({
      bucket: report.canon.users.issues,
      collection: 'users',
      docPath,
      docId: doc.id,
      data,
      rulePrefix: 'B4',
    })

    const displayName = typeof data.display_name === 'string' ? data.display_name.trim() : ''
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    if (!displayName && !name) {
      addIssue(report.canon.users.issues, {
        collection: 'users',
        docPath,
        severity: 'warn',
        rule: 'B3.display-name-missing',
        message: 'User is missing both `display_name` and `name`.',
        example: minimalExample(data, ['display_name', 'name', 'email']),
      })
    }

    auditUserAppMembershipRefs(data, docPath, 'users', report.canon.users.issues)
  })
}

// app user overlays
let appUserOverlayCount = 0
for (const appId of appIds) {
  const colPath = `apps/${appId}/users`
  try {
    const count = await countCollectionRef(db.collection(colPath))
    appUserOverlayCount += count
    if (!count) continue
    await scanCollectionPath(colPath, async (doc) => {
      const data = doc.data() || {}
      const docPath = `${colPath}/${doc.id}`
      auditCanonicalIdFields({
        bucket: report.canon.users.issues,
        collection: 'apps/*/users',
        docPath,
        docId: doc.id,
        data,
        rulePrefix: 'B4',
      })
      if (hasKey(data, 'app_id') && typeof data.app_id === 'string' && data.app_id !== appId) {
        addIssue(report.canon.users.issues, {
          collection: 'apps/*/users',
          docPath,
          severity: 'error',
          rule: 'B5.overlay-app_id-mismatch',
          message: '`app_id` field does not match parent app doc.id.',
          example: minimalExample(data, ['app_id', 'id', 'uid']),
        })
      }
      if (hasKey(data, 'appId') && typeof data.appId === 'string' && data.appId !== appId) {
        addIssue(report.canon.users.issues, {
          collection: 'apps/*/users',
          docPath,
          severity: 'error',
          rule: 'B5.overlay-appId-mismatch',
          message: '`appId` field does not match parent app doc.id.',
          example: minimalExample(data, ['appId', 'id', 'uid']),
        })
      }
    })
  } catch {
    // missing subcollection on some apps is normal
  }
}
setScanned('apps/*/users', appUserOverlayCount)

// ---------- Profiles audit ----------
function auditProfileDoc({ collectionName, docPath, docId, data, isAppOverlay }) {
  auditCanonicalIdFields({
    bucket: report.canon.profiles.issues,
    collection: isAppOverlay ? 'apps/*/' + collectionName : collectionName,
    docPath,
    docId,
    data,
    rulePrefix: 'C2',
  })

  for (const ownerKey of ['owner_uid', 'ownerUid', 'user_uid', 'userUid', 'user_id', 'userId']) {
    if (!hasKey(data, ownerKey)) continue
    const v = data[ownerKey]
    if (typeof v !== 'string') {
      addIssue(report.canon.profiles.issues, {
        collection: isAppOverlay ? `apps/*/${collectionName}` : collectionName,
        docPath,
        severity: ownerKey.toLowerCase().includes('uid') ? 'error' : 'warn',
        rule: 'C2.owner_uid-type',
        message: `\`${ownerKey}\` should be a string uid when present.`,
        example: minimalExample(data, [ownerKey, 'id']),
      })
    } else if (!isAppOverlay && (ownerKey.toLowerCase().includes('uid') || ownerKey === 'user_id' || ownerKey === 'userId') && v !== docId) {
      addIssue(report.canon.profiles.issues, {
        collection: collectionName,
        docPath,
        severity: 'warn',
        rule: 'C2.owner_uid-mismatch',
        message: `\`${ownerKey}\` does not match profile doc.id (profiles are code-defined 1:1 by uid).`,
        example: minimalExample(data, [ownerKey, 'id']),
      })
    }
  }

  walk(data, (value, pathParts) => {
    const key = pathParts[pathParts.length - 1] || ''
    const pathStr = pathParts.join('.')
    if (key === 'place_id' || key === 'placeId') {
      if (typeof value !== 'string') {
        addIssue(report.canon.profiles.issues, {
          collection: isAppOverlay ? `apps/*/${collectionName}` : collectionName,
          docPath,
          severity: 'error',
          rule: 'C3.place_id-type',
          message: `\`${pathStr}\` must be a string place id.`,
          example: { [pathStr]: shrinkValue(value) },
        })
      }
    }
    if ((key === 'place_image' || key === 'placeImage') && isGooglePlaceIconUrl(value)) {
      addIssue(report.canon.profiles.issues, {
        collection: isAppOverlay ? `apps/*/${collectionName}` : collectionName,
        docPath,
        severity: 'warn',
        rule: 'C3.place_image-google-icon',
        message: `\`${pathStr}\` appears to store a Google place icon URL; store canonical image or omit.`,
        example: { [pathStr]: String(value).slice(0, 140) },
      })
    }
  })

  if (!isAppOverlay) {
    const humanLabelKeys = ['title', 'display_name', 'name']
    const hasLabel = humanLabelKeys.some((k) => nonEmptyString(data[k]))
    if (!hasLabel) {
      addIssue(report.canon.profiles.issues, {
        collection: collectionName,
        docPath,
        severity: 'warn',
        rule: 'C4.missing-label-fields',
        message: 'Profile is missing all human-readable label fields (`title`, `display_name`, `name`).',
        example: minimalExample(data, ['title', 'display_name', 'name', 'id']),
      })
    }
  }
}

for (const collectionName of canonicalProfileCollections) {
  const rootExists = (await db.listCollections()).some((c) => c.id === collectionName)
  if (rootExists) {
    const count = await countCollectionRef(db.collection(collectionName))
    setScanned(collectionName, count)
    await scanCollectionPath(collectionName, async (doc) => {
      auditProfileDoc({ collectionName, docPath: `${collectionName}/${doc.id}`, docId: doc.id, data: doc.data() || {}, isAppOverlay: false })
    })
  }

  let appOverlayCount = 0
  for (const appId of appIds) {
    const colPath = `apps/${appId}/${collectionName}`
    try {
      const count = await countCollectionRef(db.collection(colPath))
      appOverlayCount += count
      if (!count) continue
      await scanCollectionPath(colPath, async (doc) => {
        auditProfileDoc({ collectionName, docPath: `${colPath}/${doc.id}`, docId: doc.id, data: doc.data() || {}, isAppOverlay: true })
      })
    } catch {
      // absent subcollection is normal
    }
  }
  setScanned(`apps/*/${collectionName}`, appOverlayCount)
}

// ---------- Inventory (all other collections/items) ----------
const rootCollections = await db.listCollections()
const rootCounts = {}
for (const col of rootCollections) {
  rootCounts[col.id] = await countCollectionRef(col)
}

function priorityForCollection(name) {
  const n = name.toLowerCase()
  if (/^(orders|jobs|kitchens|payments?|payment_intents|transactions|places|licenses|subscriptions)$/.test(n)) return 'high'
  if (/^(products|companies|recipes|ingredients|blogs|posts|menus|categories)$/.test(n)) return 'med'
  if (/(log|logs|debug|dev|test|tmp|temp|backup|backups|archive)/.test(n)) return 'low'
  return 'med'
}

function notesForCollection(name) {
  const map = {
    places: 'Public/user-facing place references; profiles and other entities may depend on canonical place ids.',
    kitchens: 'Operational core entity; code references nested kitchen orders/ingredients/menu stack subcollections.',
    orders: 'User/kitchen workflows and status mutations reference this collection directly.',
    products: 'Product catalogs and nested price subcollections are used by product runtime/server APIs.',
    companies: 'Business entities used by company extension fetch/update flows.',
    ingredients: 'Global ingredient registry plus kitchen-scoped ingredient workflows.',
    recipes: 'Misebox ecosystem content/runtime recipes read/write flows.',
    jobs: 'Hiring/routing domain; likely linked to professionals/agents.',
    blogs: 'Content collection; lower canon risk than auth/onboarding domains but still user-facing.',
    apps: 'Already audited in canon section; app-scoped subcollections (users/profiles/licenses) also matter.',
    users: 'Already audited in canon section; user notifications subcollection exists.',
  }
  return map[name] || 'Root Firestore collection discovered at runtime; audit based on route/API usage and schema stability.'
}

const auditedRoots = new Set(['apps', 'users', ...canonicalProfileCollections])
const inventoryEntries = []
for (const [name, count] of Object.entries(rootCounts)) {
  if (auditedRoots.has(name)) continue
  inventoryEntries.push({
    name,
    count,
    notes: notesForCollection(name),
    priority: priorityForCollection(name),
  })
}

// Known subcollections referenced in code (explicitly counted via parent traversal where practical)
async function countSubcollectionAcrossParents(parentCollection, subcollection) {
  const rootExists = rootCollections.some((c) => c.id === parentCollection)
  if (!rootExists) return 0
  let total = 0
  await scanCollectionPath(parentCollection, async (parentDoc) => {
    const colPath = `${parentCollection}/${parentDoc.id}/${subcollection}`
    try {
      total += await countCollectionRef(db.collection(colPath))
    } catch {
      // absent subcollection on a parent is normal
    }
  })
  return total
}

const subInventorySpecs = [
  {
    name: 'users/*/notifications',
    parent: 'users',
    sub: 'notifications',
    notes: 'Per-user notification feed used by header/slideover update flows.',
    priority: 'med',
  },
  {
    name: 'apps/*/licenses',
    parent: 'apps',
    sub: 'licenses',
    notes: 'App licensing subcollection used by product license API endpoints.',
    priority: 'high',
  },
  {
    name: 'kitchens/*/orders',
    parent: 'kitchens',
    sub: 'orders',
    notes: 'Kitchen runtime order subcollection used for kitchen order create/fetch/status workflows.',
    priority: 'high',
  },
  {
    name: 'kitchens/*/ingredients',
    parent: 'kitchens',
    sub: 'ingredients',
    notes: 'Kitchen-scoped ingredient stack; impacts menu/ops runtime and joins to global ingredients.',
    priority: 'high',
  },
  {
    name: 'products/*/prices',
    parent: 'products',
    sub: 'prices',
    notes: 'Price subcollections used by product pricing reads; may be app-scoped in some deployments too.',
    priority: 'high',
  },
]

for (const spec of subInventorySpecs) {
  const count = await countSubcollectionAcrossParents(spec.parent, spec.sub)
  if (count > 0 || rootCounts[spec.parent] > 0) {
    inventoryEntries.push({
      name: spec.name,
      count,
      notes: spec.notes,
      priority: spec.priority,
    })
  }
}

inventoryEntries.sort((a, b) => {
  const rank = { high: 0, med: 1, low: 2 }
  const r = rank[a.priority] - rank[b.priority]
  if (r) return r
  if (b.count !== a.count) return b.count - a.count
  return a.name.localeCompare(b.name)
})
report.inventory.collections = inventoryEntries

// Keep deterministic ordering for issues and schema
for (const section of [report.canon.apps, report.canon.users, report.canon.profiles]) {
  section.issues.sort((a, b) => {
    const sev = { error: 0, warn: 1, info: 2 }
    const s = sev[a.severity] - sev[b.severity]
    if (s) return s
    const c = String(a.collection).localeCompare(String(b.collection))
    if (c) return c
    const d = String(a.docPath).localeCompare(String(b.docPath))
    if (d) return d
    return String(a.rule).localeCompare(String(b.rule))
  })
}

const outputPath = '/tmp/fireux_canon_audit_output.json'
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
console.log(outputPath)
console.log(`SIZE_BYTES=${fs.statSync(outputPath).size}`)
console.log(`ISSUES=${summary.issues}`)
console.log(`SCANNED_KEYS=${Object.keys(summary.scanned).length}`)
