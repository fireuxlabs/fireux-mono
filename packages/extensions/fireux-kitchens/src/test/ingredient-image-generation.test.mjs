import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/ingredient/server/image-generation.ts',
      import.meta.url
    ),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
function fixture(options = {}) {
  let ingredient = {
    name: 'Carrot',
    category: 'vegetables',
    image_url: '',
    status: 'active',
    ...options.ingredient,
  }
  let admin = options.admin ?? true
  let calls = 0
  const target = { database: { kind: 'runtime' } }
  const generate = compileFunction(
    `${source}; return generateIngredientImage`,
    [
      'randomUUID',
      'createError',
      'generateFireuxImage',
      'saveStorageFileWithDownloadToken',
      'runGuardedServerTransaction',
      'INGREDIENT_MUTATION_TARGETS',
      'serverAppUsersTarget',
      'isFirestoreDocumentId',
      'serverAuditStamp',
      'assertCurator',
      'curatorContext',
      'isActiveIngredient',
    ]
  )(
    () => 'request-1',
    createError,
    async () => {
      calls++
      await options.during?.({
        set: (patch) => Object.assign(ingredient, patch),
        revoke: () => {
          admin = false
        },
      })
      if (options.fail) throw new Error('provider failed')
      return {
        data: Buffer.from('image'),
        contentType: 'image/webp',
        model: 'model',
        provider: 'openai',
      }
    },
    async () => ({ fileUrl: 'https://images.example/generated.webp' }),
    async (_, work) =>
      work({
        read: async (t) =>
          t === target
            ? { exists: true, data: structuredClone(ingredient) }
            : { exists: true, data: { role: admin ? 'admin' : 'member' } },
        update: (_, __, patch) => {
          Object.assign(ingredient, patch)
        },
      }),
    { ingredients: target },
    () => 'members',
    (id) => !!id && !id.includes('/'),
    () => ({ by: 'user' }),
    (member) => {
      if (member?.role !== 'admin')
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    },
    async () => ({ appId: 'misebox-app', uid: 'user', isDeveloper: false }),
    (item) => item?.status === 'active'
  )
  return {
    generate: () => generate({}, 'carrot'),
    read: () => ingredient,
    calls: () => calls,
  }
}

test('only authorised curators may spend or change an image', async () => {
  const f = fixture({ admin: false })
  await assert.rejects(f.generate(), /Forbidden/)
  assert.equal(f.calls(), 0)
  assert.equal(f.read().image_generation, undefined)
})
test('existing images skip generation entirely', async () => {
  const f = fixture({ ingredient: { image_url: 'uploaded' } })
  assert.equal((await f.generate()).image_url, 'uploaded')
  assert.equal(f.calls(), 0)
})
test('an active lease prevents a duplicate provider request; expired leases can retry', async () => {
  const f = fixture({
    ingredient: {
      image_generation: {
        status: 'generating',
        expires_at: Date.now() + 60_000,
      },
    },
  })
  await assert.rejects(f.generate(), /already being generated/)
  assert.equal(f.calls(), 0)
  f.read().image_generation.expires_at = 0
  assert.equal((await f.generate()).generated, true)
})
test('successful generation attaches only image and audit metadata', async () => {
  const f = fixture()
  await f.generate()
  assert.equal(f.read().image_url, 'https://images.example/generated.webp')
  assert.equal(f.read().image_generation.status, 'complete')
  assert.equal(f.read().name, 'Carrot')
})
test('an upload during generation wins', async () => {
  const f = fixture({
    during: ({ set }) => set({ image_url: 'uploaded-during-generation' }),
  })
  const result = await f.generate()
  assert.equal(result.generated, false)
  assert.equal(f.read().image_url, 'uploaded-during-generation')
})
test('identity changes and revoked access prevent attachment', async () => {
  for (const during of [
    ({ set }) => set({ name: 'Potato' }),
    ({ revoke }) => revoke(),
  ]) {
    const f = fixture({ during })
    await assert.rejects(f.generate())
    assert.equal(f.read().image_url, '')
    assert.equal(f.read().image_generation.status, 'failed')
  }
})
test('failures preserve the ingredient and release the lease for retry', async () => {
  const f = fixture({ fail: true })
  await assert.rejects(f.generate(), /provider failed/)
  assert.equal(f.read().name, 'Carrot')
  assert.equal(f.read().image_url, '')
  assert.equal(f.read().image_generation.status, 'failed')
  await assert.rejects(f.generate(), /provider failed/)
  assert.equal(f.calls(), 2)
})

test('creation saves first, skips supplied images, and survives generation failure', async () => {
  const endpoint = stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/server/api/internal/ingredients/index.post.ts',
        import.meta.url
      ),
      'utf8'
    )
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace('export default ', 'return ')
    .replaceAll('import.meta.dev', 'false')
  for (const image_url of ['', 'uploaded']) {
    const order = []
    const handler = compileFunction(endpoint, [
      'defineEventHandler',
      'readBody',
      'createIngredient',
      'generateIngredientImage',
      'console',
    ])(
      (fn) => fn,
      async () => ({}),
      async () => {
        order.push('saved')
        return { id: 'carrot', image_url }
      },
      async () => {
        order.push('generation')
        throw new Error('unavailable')
      },
      { warn: () => {} }
    )
    const result = await handler({ context: {} })
    assert.equal(result.ingredient.id, 'carrot')
    assert.deepEqual(order, image_url ? ['saved'] : ['saved', 'generation'])
  }
})

test('a background-capable host registers generation with its lifetime', async () => {
  const endpoint = stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/server/api/internal/ingredients/index.post.ts',
        import.meta.url
      ),
      'utf8'
    )
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace('export default ', 'return ')
    .replaceAll('import.meta.dev', 'false')
  let finish
  let registered
  const work = new Promise((resolve) => {
    finish = resolve
  })
  const handler = compileFunction(endpoint, [
    'defineEventHandler',
    'readBody',
    'createIngredient',
    'generateIngredientImage',
  ])(
    (fn) => fn,
    async () => ({}),
    async () => ({ id: 'carrot', image_url: '' }),
    () => work
  )
  const result = await handler({
    context: { waitUntil: () => {} },
    waitUntil: (promise) => {
      registered = promise
    },
  })
  assert.equal(result.ingredient.id, 'carrot')
  assert.ok(registered)
  finish()
  await registered
})
