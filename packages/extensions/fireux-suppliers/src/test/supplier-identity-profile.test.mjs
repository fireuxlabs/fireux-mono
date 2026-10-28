import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(file, name, deps = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replace(/import\.meta\.dev/g, 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (value) => Object.assign(Error(value.statusMessage), value)
const isFirestoreDocumentId = (id) =>
  typeof id === 'string' && Boolean(id) && !id.includes('/')
const requireFirestoreDocumentId = (id) => {
  if (!isFirestoreDocumentId(id)) throw createError({ statusCode: 400 })
  return id
}
const readMembershipAccessIds = load(
  '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  'readMembershipAccessIds'
)
const managementDeps = {
  readMembershipAccessIds,
  createError,
  isAppUserSubscription: (x) => ['free', 'premium', 'business'].includes(x),
  readFireuxEntityManagement: (x) => x,
  resolveFireuxEntityManagementAppId: (x) => x.app_id,
}
const storage = load(
  '../../../../core/fireux-core/src/runtime/server/utils/uploads/storage.ts',
  'requireFirebaseStorageDownloadUrl',
  { createError }
)
const mediaUrl = (path) =>
  `https://firebasestorage.googleapis.com/v0/b/bucket/o/${encodeURIComponent(path)}?alt=media&token=test`

const targets = {
  suppliers: 'suppliers',
  companies: 'companies',
  places: 'places',
}
const authority = load(
  '../runtime/supplier/server/team/authority.ts',
  'requireSupplierMutationAuthority',
  {
    ...managementDeps,
    APP_MUTATION_TARGETS: targets,
USER_MUTATION_TARGETS: targets,
ECOSYSTEM_MUTATION_TARGETS: targets,
FIREUX_MUTATION_TARGETS: targets,
SPROOCHLI_MUTATION_TARGETS: targets,
PLACE_MUTATION_TARGETS: targets,
KITCHEN_MUTATION_TARGETS: targets,
INGREDIENT_MUTATION_TARGETS: targets,
PRODUCT_MUTATION_TARGETS: targets,
PROPERTY_MUTATION_TARGETS: targets,
PORTFOLIO_MUTATION_TARGETS: targets,
SUPPLIER_MUTATION_TARGETS: targets,
JOB_MUTATION_TARGETS: targets,
    serverSupplierAccessTarget: (app) => `supplier_access/${app}/users`,
    serverAppUsersTarget: (app) => `apps/${app}/users`,
  }
)
const fields = load(
  '../../../fireux-places/src/runtime/place/server/identity/mutation-fields.ts',
  '({ optionalPlaceTextFields, allowedPlaceSocialKeys, allowedPlacePatchKeys })'
)
const placeNormalizers = load(
  '../../../fireux-places/src/runtime/place/utils/place-spine.ts',
  '({ normalizePlaceCurrencyCode, normalizePlaceTimezone })'
)
const normalizePlacePatch = load(
  '../../../fireux-places/src/runtime/place/server/identity/normalize-patch.ts',
  'normalizePlacePatch',
  {
    createError,
    FieldValue: { delete: () => 'DELETE' },
    APP_MUTATION_TARGETS: targets,
USER_MUTATION_TARGETS: targets,
ECOSYSTEM_MUTATION_TARGETS: targets,
FIREUX_MUTATION_TARGETS: targets,
SPROOCHLI_MUTATION_TARGETS: targets,
PLACE_MUTATION_TARGETS: targets,
KITCHEN_MUTATION_TARGETS: targets,
INGREDIENT_MUTATION_TARGETS: targets,
PRODUCT_MUTATION_TARGETS: targets,
PROPERTY_MUTATION_TARGETS: targets,
PORTFOLIO_MUTATION_TARGETS: targets,
SUPPLIER_MUTATION_TARGETS: targets,
JOB_MUTATION_TARGETS: targets,
    allowedPatchKeys: fields.allowedPlacePatchKeys,
    allowedSocialKeys: fields.allowedPlaceSocialKeys,
    optionalTextFields: fields.optionalPlaceTextFields,
    ...placeNormalizers,
    normalizePlaceBusinessHours: (x) => x || null,
    normalizeHexColor: (x) => x,
    parseBrandPalette: (x) => ({ ok: true, value: x }),
    requireFirebaseStorageDownloadUrl: storage,
    serverAuditStamp: (x) => ({ ...x, at: 'server' }),
  }
)
const stagePlaceUpdate = load(
  '../../../fireux-places/src/runtime/place/server/identity/stage-update.ts',
  'stagePlaceUpdate',
  {
    normalizePlacePatch,
    APP_MUTATION_TARGETS: targets,
USER_MUTATION_TARGETS: targets,
ECOSYSTEM_MUTATION_TARGETS: targets,
FIREUX_MUTATION_TARGETS: targets,
SPROOCHLI_MUTATION_TARGETS: targets,
PLACE_MUTATION_TARGETS: targets,
KITCHEN_MUTATION_TARGETS: targets,
INGREDIENT_MUTATION_TARGETS: targets,
PRODUCT_MUTATION_TARGETS: targets,
PROPERTY_MUTATION_TARGETS: targets,
PORTFOLIO_MUTATION_TARGETS: targets,
SUPPLIER_MUTATION_TARGETS: targets,
JOB_MUTATION_TARGETS: targets,
    serverAuditStamp: (x) => ({ ...x, at: 'server' }),
  }
)
const projectCompany = load(
  '../../../fireux-companies/src/runtime/place/server/company/canonical.ts',
  'canonicalCompanyRole',
  { isFirestoreDocumentId }
)
function harness() {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = []
  const records = new Map([
    ['suppliers/s', { company_id: 'venue', management: { mode: 'root' } }],
    ['companies/venue', { created: { at }, updated: { at } }],
    ['places/venue', { name: 'Before', timezone: 'Europe/Zurich' }],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    ['supplier_access/app/users/u', { ids: ['s'], membership_created_at: at }],
  ])
  let before = () => {}
  const update = load(
    '../runtime/supplier/server/identity/profile.ts',
    'updateSupplierProfile',
    {
      createError,
      requireFirestoreDocumentId,
      requireSupplierMutationAuthority: authority,
      stagePlaceUpdate,
      projectCompany,
      APP_MUTATION_TARGETS: targets,
USER_MUTATION_TARGETS: targets,
ECOSYSTEM_MUTATION_TARGETS: targets,
FIREUX_MUTATION_TARGETS: targets,
SPROOCHLI_MUTATION_TARGETS: targets,
PLACE_MUTATION_TARGETS: targets,
KITCHEN_MUTATION_TARGETS: targets,
INGREDIENT_MUTATION_TARGETS: targets,
PRODUCT_MUTATION_TARGETS: targets,
PROPERTY_MUTATION_TARGETS: targets,
PORTFOLIO_MUTATION_TARGETS: targets,
SUPPLIER_MUTATION_TARGETS: targets,
JOB_MUTATION_TARGETS: targets,
      runtimeStorageBucketName: () => 'bucket',
      readPlace: async (id) => ({ id, ...records.get(`places/${id}`) }),
      readSupplierMutationActor: async () => ({
        uid: 'u',
        runtimeAppId: 'app',
      }),
      runGuardedServerTransaction: async (_, run) => {
        before()
        return run({
          read: async (t, id) => ({
            exists: records.has(`${t}/${id}`),
            data: records.get(`${t}/${id}`),
          }),
          update: (...args) => writes.push(args),
        })
      },
    }
  )
  return { update, records, writes, before: (fn) => (before = fn) }
}
test('Supplier command edits only its linked Place using Place-owned normalization in the same authorized transaction', async () => {
  const h = harness()
  const result = await h.update(
    {},
    {
      supplierId: 's',
      placeId: 'venue',
      patch: { name: ' New ', tagline: '', default_currency_code: 'chf' },
    }
  )
  assert.deepEqual(h.writes[0], [
    'places',
    'venue',
    {
      name: 'New',
      tagline: 'DELETE',
      default_currency_code: 'CHF',
      updated: { by: 'u', appId: 'app', at: 'server' },
    },
  ])
  assert.equal(result.supplierId, 's')
  assert.equal(result.place.id, 'venue')
  assert.equal(h.records.get('suppliers/s').company_id, 'venue')
})
test('Supplier rejects relinking, stale/recreated access, foreign management, missing and malformed Company/Place', async () => {
  for (const invalidate of [
    (h) => h.records.delete('apps/app/users/u'),
    (h) => (h.records.get('apps/app/users/u').created.at = { seconds: 2 }),
    (h) => (h.records.get('supplier_access/app/users/u').ids = ['other']),
    (h) =>
      (h.records.get('suppliers/s').management = {
        mode: 'app',
        app_id: 'foreign',
      }),
    (h) => (h.records.get('suppliers/s').company_id = 'other'),
    (h) => h.records.delete('companies/venue'),
    (h) => h.records.set('companies/venue', { name: 'wrong schema' }),
    (h) => h.records.delete('places/venue'),
  ]) {
    const h = harness()
    h.before(() => invalidate(h))
    await assert.rejects(
      h.update(
        {},
        { supplierId: 's', placeId: 'venue', patch: { name: 'New' } }
      )
    )
    assert.equal(h.writes.length, 0)
  }
})
test('Supplier Place fields exclude claims/provider metadata and validate owned media targets', async () => {
  for (const patch of [
    {},
    { claimed_by: 'u' },
    { google: {} },
    { company_id: 'other' },
    { image_url: mediaUrl('places/other/image') },
    { logo_image: 'https://example.test/logo' },
    { default_currency_code: 'EURO' },
  ]) {
    const h = harness()
    await assert.rejects(
      h.update({}, { supplierId: 's', placeId: 'venue', patch }),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
  for (const path of [
    'places/venue/image',
    'places/venue/image/revisions/new',
  ]) {
    const h = harness()
    await h.update(
      {},
      {
        supplierId: 's',
        placeId: 'venue',
        patch: { image_url: mediaUrl(path) },
      }
    )
    assert.equal(h.writes[0][2].image_url, mediaUrl(path))
  }
})

test('shared Place update keeps business hours tied to an effective timezone', async () => {
  const hours = {
    windows: [{ days: ['monday'], open: '09:00', close: '17:00' }],
  }
  const missing = harness()
  missing.records.set('places/venue', { name: 'Before' })
  await assert.rejects(
    missing.update(
      {},
      { supplierId: 's', placeId: 'venue', patch: { business_hours: hours } }
    ),
    { statusCode: 400 }
  )
  assert.equal(missing.writes.length, 0)

  const clear = harness()
  clear.records.get('places/venue').business_hours = hours
  await clear.update(
    {},
    { supplierId: 's', placeId: 'venue', patch: { timezone: '' } }
  )
  assert.equal(clear.writes[0][2].timezone, 'DELETE')
  assert.equal(clear.writes[0][2].business_hours, 'DELETE')

  const replace = harness()
  replace.records.get('places/venue').business_hours = hours
  await replace.update(
    {},
    { supplierId: 's', placeId: 'venue', patch: { timezone: 'Europe/London' } }
  )
  assert.equal(replace.writes[0][2].timezone, 'Europe/London')
  assert.equal(Object.hasOwn(replace.writes[0][2], 'business_hours'), false)
})
