#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-20
// usage_note: plan, copy, verify, or retire legacy App-nested Entity records after a retained managed Firestore export.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillDelete } from './_lib/firestore-mutations/mcp-skill-delete.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const CONFIG = Object.freeze({
  fireux: {
    databaseId: 'fireux',
    workspace: [{ appCollection: 'projects', rootCollection: 'projects' }],
    products: true,
    ignition: true,
  },
  misebox: {
    databaseId: 'misebox',
    workspace: [{ appCollection: 'kitchens', rootCollection: 'kitchens' }],
    marketplace: true,
    profiles: true,
  },
  granite: {
    databaseId: 'granite',
    workspace: [{ appCollection: 'portfolios', rootCollection: 'portfolios' }],
  },
  buenohost: {
    databaseId: 'buenohost',
    workspace: [{ appCollection: 'properties', rootCollection: 'properties' }],
  },
})

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || '').trim()
const phase = String(args.phase || 'copy').trim()
const apply = args.apply === true
const summary = args.summary === true
const config = CONFIG[ecosystem]

if (args.help) {
  console.log(`
Plan one ecosystem:
  node scripts/migrate-firestore-entity-canon.mjs --ecosystem misebox --summary

Capture a protected, read-only cutover attestation:
  node scripts/migrate-firestore-entity-canon.mjs --ecosystem misebox \
    --summary --evidence /private/tmp/<evidence>.json \
    --export-uri gs://<retained-export>

Apply the create/update-only copy after reviewing its hash:
  node scripts/migrate-firestore-entity-canon.mjs --ecosystem misebox \\
    --apply --phase copy --confirm <planSha256> \\
    --export-uri gs://<retained-export> \\
    --backup /private/tmp/<plan-preimage>.json

Retirement is a separate verified phase and deletes only migration sources:
  node scripts/migrate-firestore-entity-canon.mjs --ecosystem misebox \\
    --apply --phase retire --confirm <planSha256> \\
    --export-uri gs://<retained-export> \\
    --backup /private/tmp/<retirement-preimage>.json
`)
  process.exit(0)
}

if (!config) {
  throw new Error(
    `Choose --ecosystem from: ${Object.keys(CONFIG).sort().join(', ')}.`
  )
}
if (phase !== 'copy' && phase !== 'retire') {
  throw new Error('--phase must be copy or retire.')
}

const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const strings = (value) =>
  Array.isArray(value) ? [...new Set(value.map(text).filter(Boolean))] : []
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function') {
    return { __timestamp: value.toDate().toISOString() }
  }
  if (typeof value.path === 'string' && value.firestore) {
    return { __reference: value.path }
  }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stable(child)])
  )
}
const sha256 = (value) =>
  createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex')
const same = (left, right) => sha256(left) === sha256(right)

const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  {
    credential: auth.credential,
    projectId: target.projectId || auth.projectId,
  },
  `entity-canon-${ecosystem}-${Date.now()}`
)
const db = getFirestore(app, config.databaseId)

const creates = []
const updates = []
const retireDeletes = []
const retireUpdates = []
const blockers = []
const verified = []
const planned = new Map()

function operationTarget(path, verb) {
  const parts = path.split('/')
  const id = parts.pop()
  return {
    id,
    target: defineFirestoreMutationTarget({
      key: `entity-canon.${ecosystem}.${verb}.${path}`,
      lane: 'mcp-skill',
      verbs: [verb],
      database: { kind: 'named', databaseId: config.databaseId },
      collectionPath: parts.join('/'),
    }),
  }
}

async function planCreate(path, data, sourcePath, options = {}) {
  const canonicalData = { ...data }
  delete canonicalData.id
  const prior = planned.get(path)
  if (prior) {
    if (!same(prior.data, canonicalData)) {
      blockers.push({ path, sourcePath, reason: 'Two sources disagree.' })
    }
    return
  }
  planned.set(path, {
    data: canonicalData,
    sourcePath,
    targetWins: options.targetWins === true,
  })
}

async function resolvePlannedCreates() {
  const entries = [...planned.entries()]
  for (let offset = 0; offset < entries.length; offset += 250) {
    const batch = entries.slice(offset, offset + 250)
    const snapshots = await db.getAll(...batch.map(([path]) => db.doc(path)))
    for (const [index, snapshot] of snapshots.entries()) {
      const [path, candidate] = batch[index]
      if (!snapshot.exists) {
        creates.push({
          path,
          sourcePath: candidate.sourcePath,
          sourceSha256: sha256(candidate.data),
          data: stable(candidate.data),
        })
      } else if (same(snapshot.data(), candidate.data)) {
        verified.push({ path, sourcePath: candidate.sourcePath })
      } else if (candidate.targetWins) {
        verified.push({
          path,
          sourcePath: candidate.sourcePath,
          resolution: 'canonical-target',
        })
      } else {
        blockers.push({
          path,
          sourcePath: candidate.sourcePath,
          reason: 'Canonical target exists with different data.',
          sourceSha256: sha256(candidate.data),
          targetSha256: sha256(snapshot.data()),
        })
      }
    }
  }
}

async function planPatch(path, patch, sourcePath) {
  const snapshot = await db.doc(path).get()
  if (!snapshot.exists) {
    blockers.push({ path, sourcePath, reason: 'Canonical root is missing.' })
    return
  }
  const data = snapshot.data() || {}
  const writable = {}
  for (const [field, value] of Object.entries(patch)) {
    if (!(field in data)) writable[field] = value
    else if (!same(data[field], value)) {
      blockers.push({
        path,
        sourcePath,
        field,
        reason: 'Canonical root field conflicts with migration source.',
      })
    }
  }
  if (Object.keys(writable).length) {
    updates.push({ path, sourcePath, patch: stable(writable) })
  }
}

async function collectDocumentTree(sourceRef, targetRef, options = {}) {
  const collections = await sourceRef.listCollections()
  for (const collection of collections) {
    if (options.excludeCollections?.has(collection.id)) continue
    const documents = await collection.get()
    for (const document of documents.docs) {
      const targetDocument = targetRef
        .collection(collection.id)
        .doc(document.id)
      await planCreate(
        targetDocument.path,
        document.data(),
        document.ref.path,
        options
      )
      retireDeletes.push({
        path: document.ref.path,
        targetPath: targetDocument.path,
      })
      await collectDocumentTree(document.ref, targetDocument, options)
    }
  }
}

function teamRole(userId, operatorIds, teamIds) {
  if (operatorIds.includes(userId)) {
    return operatorIds[0] === userId ? 'owner' : 'operator'
  }
  return operatorIds.length === 0 && teamIds[0] === userId ? 'owner' : 'member'
}

async function planWorkspaceFamily(appRef, family) {
  const supports = await appRef.collection(family.appCollection).get()
  for (const support of supports.docs) {
    const source = support.data() || {}
    const rootRef = db.collection(family.rootCollection).doc(support.id)
    const root = await rootRef.get()
    if (!root.exists) {
      blockers.push({
        path: rootRef.path,
        sourcePath: support.ref.path,
        reason: 'Workspace root is missing.',
      })
      continue
    }

    if (family.rootCollection !== 'projects') {
      const rootData = root.data() || {}
      const management = record(rootData.management)
      if (!Object.keys(management).length) {
        await planPatch(
          rootRef.path,
          { management: { mode: 'app', app_id: appRef.id } },
          support.ref.path
        )
      }
      if ('console' in rootData) {
        retireUpdates.push({ path: rootRef.path, deleteFields: ['console'] })
      }
    }

    if (family.rootCollection === 'kitchens') {
      const owned = record(source.console)
      const allowed = ['theme', 'menus', 'orders', 'tables', 'integrations']
      if ('fulfilment' in owned) {
        blockers.push({
          path: rootRef.path,
          sourcePath: support.ref.path,
          reason:
            'Kitchen fulfilment must use kitchens/{kitchenId}/fulfilment/policy.',
          fields: ['fulfilment'],
        })
      }
      const unknown = Object.keys(owned).filter(
        (field) => !allowed.includes(field)
      )
      if (unknown.length) {
        blockers.push({
          path: rootRef.path,
          sourcePath: support.ref.path,
          reason: 'Kitchen console contains unclassified fields.',
          fields: unknown.sort(),
        })
      }
      await planPatch(
        rootRef.path,
        Object.fromEntries(
          allowed
            .filter((field) => field in owned)
            .map((field) => [field, owned[field]])
        ),
        support.ref.path
      )
    }

    const operatorIds = strings(source.operator_ids)
    const teamIds = strings(source.team_ids)
    const sourceTeam = await support.ref.collection('team').get()
    const sourceTeamById = new Map(
      sourceTeam.docs.map((document) => [document.id, document])
    )
    const memberIds = [
      ...new Set([...operatorIds, ...teamIds, ...sourceTeamById.keys()]),
    ]
    for (const memberId of memberIds) {
      const sourceMember = sourceTeamById.get(memberId)
      const member = sourceMember?.data() || {}
      const userId = text(member.user_id) || memberId
      const data = {
        ...member,
        user_id: userId,
        role: teamRole(userId, operatorIds, teamIds),
        permissions: strings(member.permissions),
        status: member.status === 'inactive' ? 'inactive' : 'active',
        created: member.created || source.created,
        updated: member.updated || source.updated,
      }
      const targetPath = `${rootRef.path}/team/${memberId}`
      await planCreate(
        targetPath,
        data,
        sourceMember?.ref.path || support.ref.path,
        { targetWins: true }
      )
      if (sourceMember) {
        retireDeletes.push({ path: sourceMember.ref.path, targetPath })
      }
    }

    await collectDocumentTree(support.ref, rootRef, {
      excludeCollections: new Set(['team']),
      targetWins: true,
    })
    retireDeletes.push({ path: support.ref.path, targetPath: rootRef.path })
  }
}

function canonicalProductPrice(raw, priceId, productId, isDefault) {
  return {
    product_id: productId,
    label: text(raw.metadata?.label),
    currency: text(raw.currency).toLowerCase(),
    unit_amount: Number(raw.unit_amount || 0),
    type: raw.type === 'recurring' ? 'recurring' : 'one_time',
    ...(raw.interval ? { interval: raw.interval } : {}),
    ...(Number.isInteger(raw.interval_count)
      ? { interval_count: raw.interval_count }
      : {}),
    billing_scheme: text(raw.billing_scheme) || 'per_unit',
    active: raw.active !== false,
    default: isDefault,
    provider: 'stripe',
    provider_price_id: priceId,
    metadata: record(raw.metadata),
  }
}

async function planProducts() {
  const appRef = db.doc('apps/fireux-app')
  const nested = await appRef.collection('products').get()
  const productRoots = await db.collection('products').get()
  const providers = productRoots.docs.filter((document) =>
    document.id.startsWith('prod_')
  )
  const canonicalById = new Map(
    productRoots.docs
      .filter((document) => !document.id.startsWith('prod_'))
      .map((document) => [document.id, document])
  )
  const providerBySlug = new Map(
    providers.map((document) => [
      text(document.get('stripe_metadata_slug')) ||
        text(document.get('metadata.slug')),
      document,
    ])
  )
  for (const source of nested.docs) {
    const provider = providerBySlug.get(source.id)
    if (!provider) {
      blockers.push({
        path: `products/${source.id}`,
        sourcePath: source.ref.path,
        reason: 'Matching Stripe provider Product is missing.',
      })
      continue
    }
    const prices = await provider.ref.collection('prices').get()
    const canonicalPrices = prices.docs.map((document, index) => ({
      id: document.id,
      data: canonicalProductPrice(
        document.data(),
        document.id,
        source.id,
        index === 0
      ),
      sourcePath: document.ref.path,
    }))
    const sourceData = source.data() || {}
    const metadata = record(sourceData.metadata)
    const allowedMetadata = new Set([
      'stripe',
      'categories',
      'brands',
      'source_url',
      'availability',
      'delivery',
      // Legacy catalogue transport: route/category/status are derived from
      // canonical Product fields; pricing/provider truth lives on ProductPrice.
      'category',
      'cta',
      'ecosystem',
      'kind',
      'module',
      'pricing',
      'route',
      'status',
    ])
    const unknownMetadata = Object.keys(metadata).filter(
      (key) => !allowedMetadata.has(key)
    )
    if (unknownMetadata.length) {
      blockers.push({
        path: `products/${source.id}`,
        sourcePath: source.ref.path,
        reason: 'Product metadata contains unclassified fields.',
        fields: unknownMetadata.sort(),
      })
      continue
    }
    const product = {
      source_app_id: 'fireux-app',
      visibility: 'public',
      name: text(sourceData.name),
      tagline: text(sourceData.tagline),
      Q: text(sourceData.Q),
      A: text(sourceData.A),
      description: text(sourceData.description),
      content: text(sourceData.content),
      slug: text(sourceData.slug) || source.id,
      active: sourceData.active === true,
      main_image: text(sourceData.main_image),
      images: Array.isArray(sourceData.images) ? sourceData.images : [],
      features: Array.isArray(sourceData.features) ? sourceData.features : [],
      categories: strings(sourceData.categories || metadata.categories),
      brands: strings(sourceData.brands || metadata.brands),
      source_url: text(sourceData.source_url || metadata.source_url),
      requires_template:
        sourceData.requires_template === true ||
        metadata.availability?.requires_template === true,
      fulfillment_requirements: strings(
        sourceData.fulfillment_requirements || metadata.delivery?.requirements
      ),
      product_type: text(sourceData.product_type),
      created: sourceData.created || {
        at: sourceData.created_at,
        by: sourceData.creator_id,
        app_id: 'fireux-app',
      },
      updated: sourceData.updated || { at: sourceData.updated_at },
    }
    const targetPath = `products/${source.id}`
    await planCreate(targetPath, product, source.ref.path, { targetWins: true })
    await planPatch(targetPath, product, source.ref.path)
    const canonical = canonicalById.get(source.id)
    if (canonical) {
      const redundantFields = [
        'id',
        'source_ecosystem_id',
        'owner_type',
        'owner_id',
        'prices',
        'default_price',
        'track_stock',
        'stock',
        'metadata',
        'appId',
        'created_at',
        'updated_at',
        'creator_id',
      ].filter((field) => field in (canonical.data() || {}))
      if (redundantFields.length) {
        retireUpdates.push({ path: targetPath, deleteFields: redundantFields })
      }
    }
    retireDeletes.push({
      path: source.ref.path,
      targetPath: `products/${source.id}`,
    })
    for (const price of canonicalPrices) {
      const targetPath = `products/${source.id}/prices/${price.id}`
      await planCreate(targetPath, price.data, price.sourcePath)
      retireDeletes.push({ path: price.sourcePath, targetPath })
    }
    retireDeletes.push({
      path: provider.ref.path,
      targetPath: `products/${source.id}`,
    })
  }
}

async function planMarketplace(appRef) {
  const stores = await appRef.collection('marketplace-stores').get()
  for (const source of stores.docs) {
    const raw = source.data() || {}
    const ownerIds = strings(raw.owner_ids)
    const editorIds = strings(raw.editor_ids)
    const {
      owner_ids: _owners,
      editor_ids: _editors,
      app_id: _app,
      ...identity
    } = raw
    const store = {
      ...identity,
      management: { mode: 'app', app_id: appRef.id },
    }
    const rootPath = `marketplace-stores/${source.id}`
    await planCreate(rootPath, store, source.ref.path)
    for (const userId of [...new Set([...ownerIds, ...editorIds])]) {
      await planCreate(
        `${rootPath}/team/${userId}`,
        {
          user_id: userId,
          role: ownerIds.includes(userId) ? 'owner' : 'operator',
          permissions: [],
          status: 'active',
          created: raw.created,
          updated: raw.updated,
        },
        source.ref.path
      )
    }
    await collectDocumentTree(source.ref, db.doc(rootPath))
    retireDeletes.push({ path: source.ref.path, targetPath: rootPath })
  }
}

async function planProfiles() {
  const rootKinds = [
    ['agents', 'agent'],
    ['chefs', 'chef'],
    ['drivers', 'driver'],
    ['professionals', 'professional'],
  ]
  for (const [collection, kind] of rootKinds) {
    const profiles = await db.collection(collection).get()
    for (const source of profiles.docs) {
      const targetPath = `users/${source.id}/profiles/${kind}`
      await planCreate(
        targetPath,
        { ...source.data(), kind },
        source.ref.path,
        { targetWins: true }
      )
      retireDeletes.push({ path: source.ref.path, targetPath })
    }
  }

  const apps = await db.collection('apps').get()
  const appKinds = [
    ['agents', 'agent'],
    ['chefs', 'chef'],
    ['drivers', 'driver'],
    ['marketplace-profiles', 'marketplace'],
    ['professionals', 'professional'],
  ]
  for (const appRef of apps.docs) {
    const customers = await appRef.ref.collection('customers').get()
    for (const source of customers.docs) {
      const targetPath = `users/${source.id}/profiles/customer`
      await planCreate(
        targetPath,
        { ...source.data(), kind: 'customer' },
        source.ref.path,
        { targetWins: true }
      )
      retireDeletes.push({ path: source.ref.path, targetPath })
    }

    for (const [collection, kind] of appKinds) {
      const states = await appRef.ref.collection(collection).get()
      for (const source of states.docs) {
        const profilePath = `users/${source.id}/profiles/${kind}`
        const profile = await db.doc(profilePath).get()
        if (!profile.exists && !planned.has(profilePath)) {
          await planCreate(
            profilePath,
            {
              kind,
              created: source.get('created'),
              updated: source.get('updated'),
            },
            source.ref.path,
            { targetWins: true }
          )
        }
        const raw = source.data() || {}
        const targetPath = `${profilePath}/app-state/${appRef.id}`
        await planCreate(
          targetPath,
          {
            ...raw,
            profile_kind: kind,
            app_id: appRef.id,
          },
          source.ref.path,
          { targetWins: true }
        )
        retireDeletes.push({ path: source.ref.path, targetPath })
      }
    }
  }
}

const IGNITION_STAGES = new Set([
  'new',
  'accepted',
  'in-progress',
  'launched',
  'declined',
])

function timestampMillis(value) {
  if (value && typeof value.toMillis === 'function') return value.toMillis()
  const seconds = Number(record(value).seconds ?? record(value)._seconds)
  return Number.isFinite(seconds) ? seconds * 1_000 : 0
}

function ignitionConversation(appId, source) {
  const contact = record(source.contact)
  const business = record(source.business)
  const created = record(source.created)
  const updated = record(source.updated)
  const createdMillis = timestampMillis(created.at)
  if (!createdMillis) return null
  const stage = text(source.status)
  const delivery = record(source.delivery)
  const appJob = text(source.app_job)
  const contactName = text(contact.name)

  return {
    app_id: appId,
    kind: 'ignition',
    status:
      stage === 'launched' || stage === 'declined'
        ? 'closed'
        : stage === 'new'
          ? 'open'
          : 'pending',
    related_entity: {
      family: 'apps',
      id: appId,
      path: `apps/${appId}`,
      label: text(business.name),
    },
    participant_ids: [],
    guest_contact: {
      name: contactName,
      email: text(contact.email),
      phone: '',
      company: text(business.name),
      preferred_channel: 'email',
    },
    source_route: '/get-started',
    expires_at: Timestamp.fromMillis(createdMillis + 365 * 24 * 60 * 60 * 1000),
    last_message: {
      body: appJob,
      sender_id: '',
      sender_type: 'guest',
      sender_name: contactName,
      created_at: created.at,
    },
    ignition: {
      stage: IGNITION_STAGES.has(stage) ? stage : 'new',
      website: text(business.website),
      branding: text(business.branding),
      pages: strings(source.pages),
      app_job: appJob,
      access: text(source.access),
      origin: Object.keys(record(source.origin)).length
        ? record(source.origin)
        : null,
      delivery,
      ...(Object.keys(record(source.accepted)).length
        ? { accepted: record(source.accepted) }
        : {}),
    },
    created,
    updated: Object.keys(updated).length ? updated : created,
  }
}

async function planIgnition(appRef) {
  const requests = await appRef.collection('ignition-requests').get()
  for (const source of requests.docs) {
    const conversation = ignitionConversation(appRef.id, source.data() || {})
    if (!conversation) {
      blockers.push({
        path: `${appRef.path}/conversations/${source.id}`,
        sourcePath: source.ref.path,
        reason: 'Ignition request has no canonical created timestamp.',
      })
      continue
    }
    const targetPath = `${appRef.path}/conversations/${source.id}`
    await planCreate(targetPath, conversation, source.ref.path)
    await planCreate(
      `${targetPath}/messages/initial`,
      {
        conversation_id: source.id,
        sender_id: '',
        sender_type: 'guest',
        sender_name: conversation.guest_contact.name,
        body: conversation.ignition.app_job,
        read_by: [],
        created: conversation.created,
        updated: conversation.updated,
      },
      source.ref.path
    )
    retireDeletes.push({ path: source.ref.path, targetPath })
  }
}

const apps = await db.collection('apps').get()
for (const appRef of apps.docs) {
  for (const family of config.workspace) {
    await planWorkspaceFamily(appRef.ref, family)
  }
  if (config.marketplace) await planMarketplace(appRef.ref)
  if (config.ignition) await planIgnition(appRef.ref)
}
if (config.products) await planProducts()
if (config.profiles) await planProfiles()
await resolvePlannedCreates()

retireDeletes.sort((left, right) => {
  const depth = right.path.split('/').length - left.path.split('/').length
  return depth || left.path.localeCompare(right.path)
})
creates.sort((left, right) => left.path.localeCompare(right.path))
updates.sort((left, right) => left.path.localeCompare(right.path))
retireUpdates.sort((left, right) => left.path.localeCompare(right.path))

const planBase = {
  format: 'fireux-firestore-entity-canon-plan/1',
  ecosystem,
  projectId: target.projectId || auth.projectId,
  databaseId: config.databaseId,
  phase,
  creates,
  updates,
  retireUpdates,
  retireDeletes,
  verified,
  blockers,
}
const planSha256 = sha256(planBase)
const plan = { ...planBase, planSha256 }

if (!apply) {
  let evidence = null
  const evidencePath = text(args.evidence)
  if (evidencePath) {
    const exportUri = text(args['export-uri'])
    if (
      !exportUri.startsWith('gs://') ||
      !exportUri.includes('/entity-canon-')
    ) {
      throw new Error('Evidence requires the verified retained --export-uri.')
    }
    if (
      !evidencePath.startsWith('/private/tmp/') ||
      !evidencePath.endsWith('.json')
    ) {
      throw new Error('Evidence path must be /private/tmp/<name>.json.')
    }
    evidence = await writeProtectedJsonArtifact({
      path: evidencePath,
      payload: {
        format: 'fireux-firestore-entity-canon-evidence/1',
        capturedAt: new Date().toISOString(),
        ecosystem,
        projectId: target.projectId || auth.projectId,
        databaseId: config.databaseId,
        phase,
        planSha256,
        creates: creates.length,
        updates: updates.length,
        retireUpdates: retireUpdates.length,
        retireDeletes: retireDeletes.length,
        verified: verified.length,
        verifiedSha256: sha256(verified),
        blockers,
        exportUri,
      },
    })
  }
  console.log(
    JSON.stringify(
      summary
        ? {
            mode: 'dry-run',
            ecosystem,
            phase,
            planSha256,
            creates: creates.length,
            updates: updates.length,
            retireUpdates: retireUpdates.length,
            retireDeletes: retireDeletes.length,
            verified: verified.length,
            blockers,
            ...(evidence ? { evidence } : {}),
          }
        : { mode: 'dry-run', ...plan },
      null,
      2
    )
  )
  process.exit(blockers.length ? 2 : 0)
}

if (blockers.length)
  throw new Error('Migration has blockers; apply is disabled.')
if (text(args.confirm) !== planSha256) {
  throw new Error(`Apply requires --confirm ${planSha256}`)
}
const exportUri = text(args['export-uri'])
if (!exportUri.startsWith('gs://') || !exportUri.includes('/entity-canon-')) {
  throw new Error('Apply requires the verified retained --export-uri.')
}
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error(
    'Apply requires a new --backup /private/tmp/<name>.json path.'
  )
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-firestore-entity-canon-preimage/1',
    capturedAt: new Date().toISOString(),
    exportUri,
    plan,
  },
})

if (phase === 'copy') {
  for (const operation of creates) {
    const { target: mutationTarget, id } = operationTarget(
      operation.path,
      'create'
    )
    const data = planned.get(operation.path)?.data
    if (!data || sha256(data) !== operation.sourceSha256) {
      throw new Error(`Planned copy changed before apply: ${operation.path}`)
    }
    await mcpSkillCreate(app, mutationTarget, id, data)
  }
  for (const operation of updates) {
    const { target: mutationTarget, id } = operationTarget(
      operation.path,
      'update'
    )
    await mcpSkillUpdate(app, mutationTarget, id, operation.patch)
  }
} else {
  if (creates.length || updates.length) {
    throw new Error(
      'Retirement requires a clean copy plan with no pending writes.'
    )
  }
  for (const operation of retireUpdates) {
    const { target: mutationTarget, id } = operationTarget(
      operation.path,
      'update'
    )
    await mcpSkillUpdate(
      app,
      mutationTarget,
      id,
      Object.fromEntries(
        operation.deleteFields.map((field) => [field, FieldValue.delete()])
      )
    )
  }
  for (const operation of retireDeletes) {
    const source = await db.doc(operation.path).get()
    const targetDocument = await db.doc(operation.targetPath).get()
    if (!source.exists) continue
    if (!targetDocument.exists) {
      throw new Error(`Retirement target is missing: ${operation.targetPath}`)
    }
    const { target: mutationTarget, id } = operationTarget(
      operation.path,
      'delete'
    )
    await mcpSkillDelete(app, mutationTarget, id)
  }
}

console.log(
  JSON.stringify(
    {
      mode: 'apply',
      ecosystem,
      phase,
      ok: true,
      planSha256,
      creates: phase === 'copy' ? creates.length : 0,
      updates: phase === 'copy' ? updates.length : retireUpdates.length,
      deletes: phase === 'retire' ? retireDeletes.length : 0,
      backup,
      exportUri,
    },
    null,
    2
  )
)
