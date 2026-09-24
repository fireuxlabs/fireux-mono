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
const apps = ['misebox-app', 'baeren-ringgenberg', 'friiites', 'la-tap-berne']
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
const dish = (uid, kitchen, app = apps[0]) => ({ kitchen_id: kitchen, name: 'Soup', slug: 'soup', description: '', item_kind: 'food', is_deal: false, is_flagship: false, image: '', ...stamp(uid, app) })

before(async () => {
  const loaded = await request(`emulator/v1/projects/${project}/databases/${database}:securityRules`, { method: 'PUT', body: { rules: { files: [{ name: 'firestore.rules', content: rules }] } } })
  allowed(loaded) // Compiles the exact deployable source, including named-database Rules.
  allowed(await request(`emulator/v1/projects/${project}/databases/${database}/documents`, { method: 'DELETE' }))
  for (const [index, app] of apps.entries()) {
    const uid = `operator-${index}`
    await seed(`apps/${app}`, { ecosystem_id: 'misebox' })
    await seed(`apps/${app}/users/${uid}`, { role: 'user', subscription: 'free', created: { at: time } })
    await seed(`kitchen_access/${app}/users/${uid}`, { ids: [`kitchen-${index}`], membership_created_at: time })
    await seed(`kitchens/kitchen-${index}`, { status: 'active', visibility: false, ...stamp(uid, app) })
    await seed(`places/kitchen-${index}`, { name: 'Kitchen', ...stamp(uid, app) })
    await seed(`kitchens/kitchen-${index}/dishes/soup`, dish(uid, `kitchen-${index}`, app))
    await seed(`kitchens/kitchen-${index}/orders/order`, { status: 'received', customer: { phone: 'private' } })
    await seed(`kitchens/kitchen-${index}/menus/food`, { name: 'Food', slug: 'food', status: 'draft', sort_order: 0, ...stamp(uid, app) })
  }
  await seed('apps/misebox-app/users/outsider', { role: 'admin', created: { at: time }, kitchens: ['kitchen-0'] })
  await seed('kitchens/kitchen-0/team/outsider', { role: 'owner', user_id: 'outsider' })
  await seed('kitchens/guest', { visibility: false, ...stamp('guest') })
  await seed('places/guest', { name: 'Guest Kitchen' })
  await seed('kitchens/guest/claims/guest', { secret_hash: 'never-public' })
})

test('each Kitchen-enabled App grant reads its own Kitchen, Place, collection and orders', async () => {
  for (let index = 0; index < apps.length; index++) {
    const uid = `operator-${index}`
    for (const path of [`kitchens/kitchen-${index}`, `places/kitchen-${index}`, `kitchens/kitchen-${index}/orders/order`]) allowed(await get(path, uid))
    allowed(await query('dishes', uid, `kitchens/kitchen-${index}`))
    allowed(await get(`kitchen_access/${apps[index]}/users/${uid}`, uid))
  }
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
  await seed('kitchen_access/misebox-app/users/rejoined', { ids: ['kitchen-0'], membership_created_at: time })
  denied(await get('kitchens/kitchen-0', 'rejoined'))
  await seed('kitchen_access/misebox-app/users/no-member', { ids: ['kitchen-0'], membership_created_at: time })
  denied(await get('kitchens/kitchen-0', 'no-member'))
})
test('access records and App membership cannot be forged or self-promoted', async () => {
  denied(await write('apps/misebox-app/users/stranger', { role: 'admin', ...stamp('stranger') }, 'stranger', { create: true }))
  denied(await write('apps/misebox-app/users/operator-0', { role: 'admin', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['role', 'updated'] }))
  denied(await write('kitchen_access/misebox-app/users/stranger', { ids: ['kitchen-0'], membership_created_at: time }, 'stranger', { create: true }))
  denied(await get('kitchen_access/misebox-app/users/operator-0', 'operator-1'))
})
test('each Kitchen App can create and edit its Dish without gaining another Kitchen', async () => {
  for (const [index, app] of apps.entries()) {
    const uid = `operator-${index}`, kitchen = `kitchen-${index}`
    allowed(await write(`kitchens/${kitchen}/dishes/new`, dish(uid, kitchen, app), uid, { create: true }))
    allowed(await write(`kitchens/${kitchen}/dishes/new`, { name: 'New soup', updated: { by: uid } }, uid, { mask: ['name', 'updated'] }))
  }
  denied(await write('kitchens/kitchen-0/dishes/intruder', dish('operator-1', 'kitchen-0', apps[1]), 'operator-1', { create: true }))
})
test('create and update reject schema injection, media bypass, identity/stamp changes and invalid values', async () => {
  for (const patch of [{ admin: true }, { name: '' }, { name: 42 }, { image: 'https://untrusted' }, { kitchen_id: 'kitchen-1' }, { created: { by: 'stranger', at: time } }]) {
    denied(await write('kitchens/kitchen-0/dishes/new', { ...patch, updated: { by: 'operator-0' } }, 'operator-0', { mask: [...Object.keys(patch), 'updated'] }))
  }
  denied(await write('kitchens/kitchen-0/dishes/bad', { ...dish('operator-0', 'kitchen-0'), extra: true }, 'operator-0', { create: true }))
})
test('Menu publication, rename, schedule and creation stay server-only; description editing works', async () => {
  allowed(await write('kitchens/kitchen-0/menus/food', { description: 'Lunch', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['description', 'updated'] }))
  for (const [key, value] of Object.entries({ status: 'published', name: 'Renamed', slug: 'renamed', schedule: 'daily' })) denied(await write('kitchens/kitchen-0/menus/food', { [key]: value, updated: { by: 'operator-0' } }, 'operator-0', { mask: [key, 'updated'] }))
  denied(await write('kitchens/kitchen-0/menus/third', { name: 'Third', ...stamp('operator-0') }, 'operator-0', { create: true }))
})
test('ordinary Menu sections/items work; daily date creation and foreign Dish references are denied', async () => {
  const section = { kitchen_id: 'kitchen-0', menu_id: 'food', label: 'Lunch', description: '', status: 'active', sort_order: 0, ...stamp('operator-0') }
  allowed(await write('kitchens/kitchen-0/menus/food/sections/lunch', section, 'operator-0', { create: true }))
  const item = { kitchen_id: 'kitchen-0', menu_id: 'food', section_id: 'lunch', dish_id: 'soup', price: 12, price_options: [], add_ons: [], status: 'active', sort_order: 0, ...stamp('operator-0') }
  allowed(await write('kitchens/kitchen-0/menus/food/sections/lunch/items/soup', item, 'operator-0', { create: true }))
  denied(await write('kitchens/kitchen-0/menus/food/sections/lunch/items/bad', { ...item, dish_id: 'missing' }, 'operator-0', { create: true }))
  denied(await write('kitchens/kitchen-0/menus/food/sections/date', { ...section, date: '2026-09-24' }, 'operator-0', { create: true }))
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
    await seed('kitchen_access/misebox-app/users/malformed', { ids, membership_created_at: time })
    denied(await get('kitchens/kitchen-0/dishes/soup', 'malformed'))
  }
  await seed('kitchen_access/misebox-app/users/malformed', { ids: ['deleted'], membership_created_at: time })
  await seed('kitchens/deleted/dishes/soup', dish('malformed', 'deleted'))
  denied(await get('kitchens/deleted/dishes/soup', 'malformed'))
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
test('Recipe and Prep Item authoring preserve scope and deny invalid create/update payloads', async () => {
  const common = { kitchen_id: 'kitchen-0', name: 'Soup', slug: 'soup', description: '', source_language: 'en', names: {}, descriptions: {}, ...stamp('operator-0') }
  const recipe = { ...common, preparation: { status: 'draft', yield: { quantity: 1, unit: 'portion' }, ingredients: [], prep_items: [], method: [], source_note: '' } }
  allowed(await write('kitchens/kitchen-0/recipes/soup', recipe, 'operator-0', { create: true }))
  allowed(await write('kitchens/kitchen-0/recipes/soup', { description: 'Updated', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['description', 'updated'] }))
  denied(await write('kitchens/kitchen-0/recipes/soup', { preparation: { ...recipe.preparation, ingredients: 'invalid' }, updated: { by: 'operator-0' } }, 'operator-0', { mask: ['preparation', 'updated'] }))
  const prep = { ...common, station: '', inputs: [], recipe_id: '', yield: { quantity: 1, unit: 'portion' }, method: [] }
  allowed(await write('kitchens/kitchen-0/prep-items/soup', prep, 'operator-0', { create: true }))
  denied(await write('kitchens/kitchen-0/prep-items/bad', { ...prep, kitchen_id: 'other' }, 'operator-0', { create: true }))
})
test('Station and sourcing-link CRUD remain scoped, while immutable waste records cannot be edited', async () => {
  const station = { kitchen_id: 'kitchen-0', name: 'Grill', description: '', active: true, sort_order: 0, ...stamp('operator-0') }
  allowed(await write('kitchens/kitchen-0/stations/grill', station, 'operator-0', { create: true }))
  allowed(await write('kitchens/kitchen-0/stations/grill', { name: 'Hot', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['name', 'updated'] }))
  denied(await write('kitchens/kitchen-0/stations/grill', { active: 'yes', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['active', 'updated'] }))
  const link = { kitchen_id: 'kitchen-0', supplier_id: 'supplier', ingredient_id: 'carrot', ...stamp('operator-0') }
  allowed(await write('kitchens/kitchen-0/supplier-ingredients/carrot', link, 'operator-0', { create: true }))
  denied(await write('kitchens/kitchen-0/supplier-ingredients/carrot', { kitchen_id: 'other', updated: { by: 'operator-0' } }, 'operator-0', { mask: ['kitchen_id', 'updated'] }))
  await seed('kitchens/kitchen-0/waste-events/waste', { kitchen_id: 'kitchen-0', quantity: 1 })
  denied(await write('kitchens/kitchen-0/waste-events/waste', { quantity: 2 }, 'operator-0', { mask: ['quantity'] }))
})
