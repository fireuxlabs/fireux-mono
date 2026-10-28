import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { readFile } from 'node:fs/promises'

// Deliberately no fallback to real Firebase. Missing emulator fails release preflight.
const host = process.env.FIRESTORE_EMULATOR_HOST
assert.match(host || '', /^(127\.0\.0\.1|localhost):\d+$/, 'Start a local Firestore emulator and set FIRESTORE_EMULATOR_HOST; production Rules tests cannot be skipped.')
const project = 'demo-misebox-production-rules'
const database = 'misebox'
const base = `http://${host}`
const documents = `projects/${project}/databases/${database}/documents`
const rules = await readFile(new URL('../../../../packages/ecosystem/fireux-misebox/src/config/firebase/firestore.production.rules', import.meta.url), 'utf8')
const apps = ['misebox-app', 'baeren-ringgenberg', 'friiites', 'la-tap-berne', 'bangin-coffee', 'interlaken-essen']
const time = { timestampValue: '2026-09-01T00:00:00Z' }

function value(input) {
  if (input?.timestampValue) return input
  if (input === null) return { nullValue: null }
  if (typeof input === 'string') return { stringValue: input }
  if (typeof input === 'boolean') return { booleanValue: input }
  if (typeof input === 'number') return { doubleValue: input }
  if (Array.isArray(input)) return { arrayValue: { values: input.map(value) } }
  return { mapValue: { fields: fields(input) } }
}
function fields(input) { return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, value(v)])) }
function token(uid, provider = 'password') {
  const encode = (v) => Buffer.from(JSON.stringify(v)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
    iss: `https://securetoken.google.com/${project}`, aud: project,
    sub: uid, user_id: uid, iat: now, exp: now + 3600, auth_time: now,
    firebase: { sign_in_provider: provider, identities: {} },
  })}.`
}
async function request(path, { method = 'GET', body, auth } = {}) {
  const response = await fetch(`${base}/${path}`, {
    method, headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  })
  const text = await response.text()
  return { status: response.status, text }
}
async function seed(path, data) {
  const result = await request(`v1/${documents}/${path}`, { method: 'PATCH', auth: 'owner', body: { fields: fields(data) } })
  assert.equal(result.status, 200, result.text)
}
async function seedAccess(app, uid, data) {
  const path = `kitchen_access/${uid}`
  const current = await request(`v1/${documents}/${path}`, { auth: 'owner' })
  assert.ok([200, 404].includes(current.status), current.text)
  const apps = current.status === 200 ? JSON.parse(current.text).fields.apps.mapValue.fields : {}
  const result = await request(`v1/${documents}/${path}`, { method: 'PATCH', auth: 'owner', body: {
    fields: { apps: { mapValue: { fields: { ...apps, [app]: value(data) } } } }
  } })
  assert.equal(result.status, 200, result.text)
}
async function get(path, uid, provider) { return request(`v1/${documents}/${path}`, { auth: uid ? token(uid, provider) : undefined }) }
async function write(path, data, uid, { create = false, mask, remove = false, stamped = true } = {}) {
  const write = remove ? { delete: `${documents}/${path}` } : {
    update: { name: `${documents}/${path}`, fields: fields(data) },
    ...(mask ? { updateMask: { fieldPaths: mask } } : {}),
    ...(stamped ? { updateTransforms: [ ...(create ? [{ fieldPath: 'created.at', setToServerValue: 'REQUEST_TIME' }] : []), { fieldPath: 'updated.at', setToServerValue: 'REQUEST_TIME' } ] } : {}),
    currentDocument: { exists: !create },
  }
  return request(`v1/${documents}:commit`, { method: 'POST', auth: token(uid), body: { writes: [write] } })
}
async function query(collection, uid, parent = '', where) {
  return request(`v1/${documents}${parent ? `/${parent}` : ''}:runQuery`, {
    method: 'POST', auth: uid ? token(uid) : undefined,
    body: { structuredQuery: { from: [{ collectionId: collection }], ...(where ? { where } : {}) } },
  })
}
function allowed(result) { assert.equal(result.status, 200, result.text) }
function denied(result) { assert.equal(result.status, 403, result.text) }
const stamp = (uid, app = apps[0]) => ({ created: { by: uid, app_id: app, at: time }, updated: { by: uid, at: time } })
const dish = (uid, kitchen, app = apps[0]) => ({ kitchen_id: kitchen, name: 'Soup', slug: 'soup', description: '', item_kind: 'food', is_flagship: false, image: '', ...stamp(uid, app) })

before(async () => {
  const loaded = await request(`emulator/v1/projects/${project}/databases/${database}:securityRules`, { method: 'PUT', body: { rules: { files: [{ name: 'firestore.rules', content: rules }] } } })
  allowed(loaded) // Compiles the exact deployable source, including named-database Rules.
  allowed(await request(`emulator/v1/projects/${project}/databases/${database}/documents`, { method: 'DELETE' }))
  for (const [index, app] of apps.entries()) {
    const uid = `operator-${index}`
    await seed(`apps/${app}`, { ecosystem_id: 'misebox' })
    await seed(`apps/${app}/users/${uid}`, { role: 'user', subscription: 'free', created: { at: time } })
    await seedAccess(app, uid, { ids: [`kitchen-${index}`], membership_created_at: time })
    await seed(`kitchens/kitchen-${index}`, { identity: { source: 'user', status: 'active', visibility: false }, ...stamp(uid, app) })
    await seed(`places/kitchen-${index}`, { name: 'Kitchen', ...stamp(uid, app) })
    await seed(`kitchens/kitchen-${index}/dishes/soup`, dish(uid, `kitchen-${index}`, app))
    await seed(`kitchens/kitchen-${index}/orders/order`, { status: 'received', customer: { phone: 'private' } })
    await seed(`kitchens/kitchen-${index}/offerings/lunch`, { name: 'Lunch', enabled: true, menu_ids: ['food'], interactions: [{ type: 'browse', enabled: true }] })
    await seed(`kitchens/kitchen-${index}/sellables/soup`, { item_id: 'soup', price: 12 })
    await seed(`kitchens/kitchen-${index}/menus/food`, { name: 'Food', slug: 'food', status: 'draft', sort_order: 0, ...stamp(uid, app) })
  }
  await seed('apps/misebox-app/users/outsider', { role: 'admin', created: { at: time }, kitchens: ['kitchen-0'] })
  await seed('kitchens/kitchen-0/team/outsider', { role: 'owner', user_id: 'outsider' })
  await seed('kitchens/guest', { identity: { source: 'user', status: 'active', visibility: false }, ...stamp('guest') })
  await seed('places/guest', { name: 'Guest Kitchen' })
  await seed('kitchens/guest/claims/guest', { secret_hash: 'never-public' })
})

test('each Kitchen-enabled App grant reads its own Kitchen, Place, collection and orders', async () => {
  for (let index = 0; index < apps.length; index++) {
    const uid = `operator-${index}`
    for (const path of [`kitchens/kitchen-${index}`, `places/kitchen-${index}`, `kitchens/kitchen-${index}/orders/order`]) allowed(await get(path, uid))
    allowed(await query('dishes', uid, `kitchens/kitchen-${index}`))
    allowed(await get(`kitchen_access/${uid}`, uid))
  }
})
test('Offering reads follow all six App grants; all writes and private descendants stay server-only', async () => {
  for (const [index] of apps.entries()) {
    const kitchen = `kitchens/kitchen-${index}`, uid = `operator-${index}`
    allowed(await get(`${kitchen}/offerings/lunch`, uid))
    allowed(await query('offerings', uid, kitchen))
    denied(await write(`${kitchen}/offerings/new`, { name: 'Injected' }, uid, { create: true }))
    denied(await write(`${kitchen}/offerings/lunch`, { enabled: false }, uid, { mask: ['enabled'] }))
    denied(await write(`${kitchen}/offerings/lunch`, {}, uid, { remove: true }))
    denied(await get(`${kitchen}/offerings/lunch/private/secret`, uid))
    // Sellable terms use the trusted server projection, never raw browser reads.
    denied(await get(`${kitchen}/sellables/soup`, uid))
    denied(await query('sellables', uid, kitchen))
  }
  for (const uid of [undefined, 'stranger', 'outsider', 'operator-1']) {
    denied(await get('kitchens/kitchen-0/offerings/lunch', uid))
    denied(await query('offerings', uid, 'kitchens/kitchen-0'))
  }
  denied(await get('kitchens/kitchen-0/offerings/lunch', 'operator-0', 'anonymous'))
  await seed('apps/unknown-app/users/unknown-operator', { role: 'admin', created: { at: time } })
  await seedAccess('unknown-app', 'unknown-operator', { ids: ['kitchen-0'], membership_created_at: time })
  denied(await get('kitchens/kitchen-0/offerings/lunch', 'unknown-operator'))
})

test('unauthenticated, unrelated, admin-only and obsolete Team/AppUser arrays grant no Kitchen access', async () => {
  for (const uid of [undefined, 'stranger', 'outsider', 'operator-1']) {
    denied(await get('kitchens/kitchen-0', uid))
    denied(await get('kitchens/kitchen-0/orders/order', uid))
    denied(await query('dishes', uid, 'kitchens/kitchen-0'))
  }
})
test('guest can read only its exact root and Place, including missing pre-creation roots', async () => {
  allowed(await get('kitchens/guest', 'guest', 'anonymous'))
  allowed(await get('places/guest', 'guest', 'anonymous'))
  assert.equal((await get('kitchens/new-guest', 'new-guest', 'anonymous')).status, 404)
  for (const path of ['kitchens/guest/claims/guest', 'kitchens/guest/menus/food', 'kitchens/kitchen-0']) denied(await get(path, 'guest', 'anonymous'))
  denied(await query('kitchens', 'guest'))
  await seed('kitchens/guest/claims/guest', { secret_hash: 'never-public', claimed_by: 'operator-0' })
  denied(await get('kitchens/guest', 'guest', 'anonymous'))
})
test('membership revocation and rejoin invalidate an old grant', async () => {
  await seed('apps/misebox-app/users/rejoined', { role: 'user', created: { at: { timestampValue: '2026-09-02T00:00:00Z' } } })
  await seedAccess('misebox-app', 'rejoined', { ids: ['kitchen-0'], membership_created_at: time })
  denied(await get('kitchens/kitchen-0', 'rejoined'))
  denied(await get('kitchens/kitchen-0/offerings/lunch', 'rejoined'))
  await seedAccess('misebox-app', 'no-member', { ids: ['kitchen-0'], membership_created_at: time })
  denied(await get('kitchens/kitchen-0', 'no-member'))
  denied(await query('offerings', 'no-member', 'kitchens/kitchen-0'))
})
test('matching grants with unrelated Kitchen ids do not exhaust the six-App read budget', async () => {
  const uid = 'multi-app-operator'
  for (const [index, app] of apps.entries()) {
    await seed(`apps/${app}/users/${uid}`, { role: 'user', created: { at: time } })
    await seedAccess(app, uid, { ids: [index === apps.length - 1 ? 'kitchen-5' : `other-${index}`], membership_created_at: time })
  }
  allowed(await get('kitchens/kitchen-5/offerings/lunch', uid))
  allowed(await query('offerings', uid, 'kitchens/kitchen-5'))
})

test('access records and App membership cannot be forged or self-promoted', async () => {
  denied(await write('apps/misebox-app/users/stranger', { role: 'admin', ...stamp('stranger') }, 'stranger', { create: true }))
  denied(await write('apps/misebox-app/users/operator-0', { role: 'admin', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['role', 'updated'] }))
  denied(await write('kitchen_access/stranger', { ids: ['kitchen-0'], membership_created_at: time }, 'stranger', { create: true }))
  denied(await get('kitchen_access/operator-0', 'operator-1'))
})
test('each Kitchen App reads its Dish but cannot bypass trusted create, update or delete', async () => {
  for (const [index, app] of apps.entries()) {
    const uid = `operator-${index}`, kitchen = `kitchen-${index}`
    allowed(await get(`kitchens/${kitchen}/dishes/soup`, uid))
    denied(await write(`kitchens/${kitchen}/dishes/new`, dish(uid, kitchen, app), uid, { create: true }))
    denied(await write(`kitchens/${kitchen}/dishes/soup`, { name: 'New soup', updated: { by: uid } }, uid, { mask: ['name', 'updated'] }))
    denied(await write(`kitchens/${kitchen}/dishes/soup`, {}, uid, { remove: true }))
  }
  denied(await write('kitchens/kitchen-0/dishes/intruder', dish('operator-1', 'kitchen-0', apps[1]), 'operator-1', { create: true }))
})
test('Menu metadata and nested content stay readable but require commands for all mutations', async () => {
  const base = 'kitchens/kitchen-0/menus/food'
  await seed(`${base}/sections/lunch`, { kitchen_id: 'kitchen-0', menu_id: 'food', label: 'Lunch', status: 'active' })
  await seed(`${base}/sections/lunch/items/soup`, { kitchen_id: 'kitchen-0', menu_id: 'food', section_id: 'lunch', dish_id: 'soup', status: 'active' })
  for (const path of [base, `${base}/sections/lunch`, `${base}/sections/lunch/items/soup`]) {
    allowed(await get(path, 'operator-0'))
    denied(await get(path, 'operator-1'))
    denied(await write(`${path}-new`, { name: 'Injected', ...stamp('operator-0') }, 'operator-0', { create: true }))
    denied(await write(path, { description: 'Changed', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['description', 'updated'] }))
    denied(await write(path, {}, 'operator-0', { remove: true }))
  }
})
test('claims, integrations, kiosk secrets and unknown descendants remain unreadable to operators', async () => {
  for (const path of ['claims/guest', 'integrations/website-ordering', 'kiosks/device', 'private/secret', 'unknown/record', 'menus/food/private/secret']) denied(await get(`kitchens/kitchen-0/${path}`, 'operator-0'))
})
test('orders, sales, Team, grants and public projections cannot be mutated directly', async () => {
  for (const path of ['kitchens/kitchen-0/orders/new', 'kitchens/kitchen-0/sales/new', 'kitchens/kitchen-0/team/new', 'menus/public', 'ingredients/new', 'places/new']) denied(await write(path, { name: 'Injected', ...stamp('operator-0') }, 'operator-0', { create: true }))
})
test('unfiltered public Blogs/Products queries fail closed', async () => {
  await seed('blogs/private', { status: 'draft', source_app_id: 'interlaken-essen' })
  await seed('products/private', { status: 'draft', source_app_id: 'baeren-ringgenberg' })
  denied(await query('blogs'))
  denied(await query('products'))
})

test('malformed grants and deleted Kitchen parents cannot expose children', async () => {
  await seed('apps/misebox-app/users/malformed', { role: 'user', created: { at: time } })
  for (const ids of [['kitchen-0', 'kitchen-0'], ['kitchen-0', ''], ['kitchen-0', 'bad/id']]) {
    await seedAccess('misebox-app', 'malformed', { ids, membership_created_at: time })
    denied(await get('kitchens/kitchen-0/dishes/soup', 'malformed'))
    denied(await query('offerings', 'malformed', 'kitchens/kitchen-0'))
  }
  await seedAccess('misebox-app', 'malformed', { ids: ['deleted'], membership_created_at: time })
  await seed('kitchens/deleted/dishes/soup', dish('malformed', 'deleted'))
  denied(await get('kitchens/deleted/dishes/soup', 'malformed'))
  await seed('kitchens/deleted/offerings/lunch', { name: 'Lunch', enabled: true, menu_ids: [], interactions: [{ type: 'browse', enabled: true }] })
  denied(await get('kitchens/deleted/offerings/lunch', 'malformed'))
  denied(await write('kitchens/deleted/dishes/new', dish('malformed', 'deleted'), 'malformed', { create: true }))
})

test('exact-App editors can author Products, Blogs and provisioned prices without crossing Apps', async () => {
  const uid = 'author'
  await seed('apps/friiites/users/author', { role: 'admin', created: { at: time } })
  const common = { source_app_id: 'friiites', visibility: 'app', created: { by: uid, at: time }, updated: { by: uid, at: time } }
  const product = { ...common, slug: 'authored', name: 'Meal', tagline: '', Q: '', A: '', description: '', content: '', active: true, main_image: '', source_url: '', product_type: '', requires_template: false, images: [], features: [], categories: [], brands: [], fulfillment_requirements: [] }
  allowed(await write('products/authored', product, uid, { create: true }))
  allowed(await write('products/authored', { name: 'Dinner', updated: { by: uid } }, uid, { mask: ['name', 'updated'] }))
  denied(await write('products/authored', { source_app_id: 'misebox-app', updated: { by: uid } }, uid, { mask: ['source_app_id', 'updated'] }))
  const blog = { ...common, slug: 'authored', publication_scope: 'app', title: 'Opening', content: '', metaDescription: '', author: { id: uid, display_name: 'Chef', avatar: '' }, keywords: [], tags: [], canonicalUrl: '', featuredImage: '', featuredImageAlt: '', socialImage: '', readingTime: '', cta_link: '', cta_text: '', type: 'article', product_id: '', editorial_review: { source_kind: 'human', privacy_reviewed: false, facts_reviewed: false, names_approved: false } }
  allowed(await write('blogs/authored', blog, uid, { create: true }))
  allowed(await write('blogs/authored', { title: 'Open today', updated: { by: uid } }, uid, { mask: ['title', 'updated'] }))
  denied(await write('blogs/authored', { title: 'Intrusion', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['title', 'updated'] }))
  const now = { timestampValue: new Date().toISOString() }
  const price = { product_id: 'authored', label: '', currency: 'chf', unit_amount: 1500, type: 'one_time', billing_scheme: 'per_unit', active: true, default: true, provider: 'stripe', provider_price_id: 'price_proof', metadata: {}, created: { at: now, by: uid }, updated: { at: now, by: uid } }
  allowed(await write('products/authored/prices/price_proof', price, uid, { create: true, stamped: false }))
  denied(await get('products/authored/prices/price_proof'))
  denied(await write('products/authored/prices/price_wrong', { ...price, product_id: 'foreign', provider_price_id: 'price_wrong' }, uid, { create: true, stamped: false }))
})

const eq = (field, input) => ({ fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: value(input) } })
test('signed-in accounts read only their own User root, without granting collection or private-child access', async () => {
  await seed('users/profile-owner', { display_name: 'Profile owner', handle: 'profile-owner', bio: '', avatar: 'https://example.com/photo.jpg', private_fixture: 'must-not-be-public' })
  allowed(await get('users/profile-owner', 'profile-owner', 'google.com'))
  assert.equal((await get('users/new-account', 'new-account', 'google.com')).status, 404)
  for (const uid of [undefined, 'operator-0', 'outsider']) denied(await get('users/profile-owner', uid))
  denied(await get('users/profile-owner', 'profile-owner', 'anonymous'))
  denied(await query('users', 'profile-owner'))
  for (const path of ['private/preferences', 'orders/order', 'apps/misebox-app']) denied(await get(`users/profile-owner/${path}`, 'profile-owner'))
  denied(await write('users/profile-owner', { display_name: 'Changed' }, 'profile-owner', { mask: ['display_name'] }))
})

test('public Product queries must request published active records; authoring is exact-App admin scoped', async () => {
  await seed('apps/baeren-ringgenberg/users/editor', { role: 'admin', created: { at: time } })
  await seed('products/published', { visibility: 'public', active: true, source_app_id: 'baeren-ringgenberg' })
  await seed('products/unpublished', { visibility: 'app', active: false, source_app_id: 'baeren-ringgenberg' })
  allowed(await query('products', undefined, '', { compositeFilter: { op: 'AND', filters: [eq('visibility', 'public'), eq('active', true)] } }))
  allowed(await query('products', 'editor', '', eq('source_app_id', 'baeren-ringgenberg')))
  denied(await query('products', 'editor'))
  denied(await get('products/unpublished', 'operator-1'))
  allowed(await query('blogs', 'editor', '', eq('source_app_id', 'baeren-ringgenberg')))
  denied(await query('blogs', 'editor', '', eq('source_app_id', 'interlaken-essen')))
})
test('guest App session reads only known canonical public identity, not membership lists or unknown fields', async () => {
  allowed(await get('apps/misebox-app'))
  denied(await query('users', undefined, 'apps/misebox-app'))
  await seed('apps/bangin-coffee', { name: 'Coffee', private_secret: 'must-not-leak' })
  denied(await get('apps/bangin-coffee'))
  denied(await get('apps/unknown'))
})
test('actual Kitchen collection lookup by document ids remains authorized', async () => {
  const where = { fieldFilter: { field: { fieldPath: '__name__' }, op: 'IN', value: { arrayValue: { values: [{ referenceValue: `${documents}/kitchens/kitchen-3` }] } } } }
  allowed(await query('kitchens', 'operator-3', '', where))
  denied(await query('kitchens', 'operator-0', '', where))
})
test('Kitchen root, Recipe, Prep, Station, sourcing and Waste mutations stay server-owned', async () => {
  const root = 'kitchens/kitchen-0'
  for (const child of ['recipes/soup', 'prep-items/soup', 'stations/grill', 'supplier-ingredients/carrot', 'waste-events/waste']) {
    const path = `${root}/${child}`
    await seed(path, { kitchen_id: 'kitchen-0', name: 'Fixture', ...stamp('operator-0') })
    allowed(await get(path, 'operator-0'))
    denied(await write(`${path}-new`, { kitchen_id: 'kitchen-0', name: 'Injected', ...stamp('operator-0') }, 'operator-0', { create: true }))
    denied(await write(path, { name: 'Changed', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['name', 'updated'] }))
    denied(await write(path, {}, 'operator-0', { remove: true }))
  }
  denied(await write(root, { name: 'Changed', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['name', 'updated'] }))
  denied(await write(root, {}, 'operator-0', { remove: true }))
})

// Required release gate: authority must remain reachable within Firestore's access budget.
test('stale same-Kitchen grants in five Apps do not hide a current sixth-App membership', async () => {
 const uid='stale-multi-app';
 for(const [index,app] of apps.entries()){
 await seed(`apps/${app}/users/${uid}`,{role:'user',created:{at:index===apps.length-1?time:{timestampValue:'2026-09-02T00:00:00Z'}}});
 await seedAccess(app, uid,{ids:['kitchen-5'],membership_created_at:time});
 }
 allowed(await get('kitchens/kitchen-5/offerings/lunch',uid));
});

test('canonical index is own-read only, trusted-write only, and old grant descendants stay retired', async () => {
  allowed(await get('kitchen_access/operator-0', 'operator-0'))
  denied(await get('kitchen_access/operator-0', 'operator-1'))
  denied(await query('kitchen_access', 'operator-0'))
  for (const operation of [{ create: true }, { mask: ['apps'] }, { remove: true }]) {
    const path = operation.create ? 'kitchen_access/new-user' : 'kitchen_access/operator-0'
    denied(await write(path, { apps: { 'misebox-app': { ids: ['kitchen-0'], membership_created_at: time } } }, 'operator-0', operation))
  }
  denied(await get('kitchen_access/misebox-app/users/operator-0', 'operator-0'))
})

test('over-capacity and unexpected grant fields fail closed', async () => {
  const uid = 'bad-index'
  await seed('apps/misebox-app/users/bad-index', { role: 'user', created: { at: time } })
  for (const data of [
    { ids: ['kitchen-0', ...Array.from({length:50}, (_,i)=>`k-${i}`)], membership_created_at: time },
    { ids: ['kitchen-0'], membership_created_at: time, role: 'admin' },
  ]) {
    await seedAccess('misebox-app', uid, data)
    denied(await get('kitchens/kitchen-0/offerings/lunch', uid))
  }
})


test('deleted or malformed earlier App grants do not hide valid sixth-App authority', async () => {
  for (const mode of ['deleted-memberships', 'malformed-grants']) {
    const uid = `multi-app-${mode}`
    for (const [index, app] of apps.entries()) {
      const last = index === apps.length - 1
      if (last || mode === 'malformed-grants')
        await seed(`apps/${app}/users/${uid}`, { role: 'user', created: { at: time } })
      await seedAccess(app, uid, { ids: ['kitchen-5'], membership_created_at: last || mode === 'deleted-memberships' ? time : 'invalid-timestamp' })
    }
    allowed(await get('kitchens/kitchen-5/offerings/lunch', uid))
  }
})

test('non-string ids and non-timestamp membership bindings never grant access', async () => {
  const uid = 'invalid-grant-types'
  await seed(`apps/misebox-app/users/${uid}`, { role: 'user', created: { at: time } })
  for (const data of [
    { ids: ['kitchen-0', 1], membership_created_at: time },
    { ids: ['kitchen-0', true], membership_created_at: time },
    { ids: ['kitchen-0'], membership_created_at: '2026-09-01T00:00:00Z' },
  ]) {
    await seedAccess('misebox-app', uid, data)
    denied(await get('kitchens/kitchen-0/offerings/lunch', uid))
  }
})
