import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const repo = new URL('../../../../../', import.meta.url)
const source = (path) => readFileSync(new URL(path, repo), 'utf8')
const ecosystem = 'packages/ecosystem/fireux-fireux/src/runtime/'
const strip = (text, dev = true) =>
  stripTypeScriptTypes(
    text
      .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
      .replace(/^export /gm, '')
      .replaceAll('import.meta.dev', String(dev))
  )
function load(text, dependencies, returned, dev = true) {
  return compileFunction(
    `${strip(text, dev)}\nreturn ${returned}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const intent = (
  action = 'none',
  target = '',
  message = 'Ready for review.'
) => ({ action, target, message })
const body = () => ({
  capability: 'landing',
  prompt: 'Open Create Project',
  context: {
    intro: {
      purpose: 'Projects',
      private: 'omit',
      allowance: {
        description: 'Free allowance is configured.',
        secret: 'omit',
      },
    },
    collection: {
      records: [
        { id: 'p1', name: 'First', private: 'omit' },
        { id: 'p2', name: 'Second' },
      ],
    },
    selected: { id: 'p1' },
    derived: { status: 'ready', canCreate: true, canPrepareApp: true },
  },
})
function server(
  result = intent(),
  identity = { uid: 'u1' },
  dev = true,
  ok = true
) {
  let request,
    options,
    authCalls = 0
  const run = load(
    source(ecosystem + 'project/server/landing-intent.ts'),
    {
      createError: (error) =>
        Object.assign(new Error(error.statusMessage), error),
      firebaseBearerUser: async () => {
        authCalls++
        if (identity instanceof Error) throw identity
        return identity
      },
      useFireUXConfig: () => ({ appId: 'fireux-app' }),
      useFireuxAi: (_, opts) => {
        options = opts
        return {
          generateJson: async (input) => {
            request = input
            return { ok, data: result }
          },
        }
      },
    },
    'interpretProjectLanding',
    dev
  )
  return {
    run,
    request: () => request,
    options: () => options,
    authCalls: () => authCalls,
  }
}
test('landing bounds client facts and selects only exact visible Project ids', async () => {
  const h = server(intent('read', 'p2'))
  assert.equal((await h.run({}, body())).target, 'p2')
  assert.deepEqual(h.request().context.records, [
    { id: 'p1', name: 'First' },
    { id: 'p2', name: 'Second' },
  ])
  assert.equal(h.request().context.introduction.private, undefined)
  assert.equal(
    h.request().context.introduction.allowance,
    'Free allowance is configured.'
  )
  assert.equal(h.options().developmentTransport, 'codex')
  assert.equal(h.request().model, 'gpt-5.6-sol')
  const production = server(intent(), { uid: 'u1' }, false)
  await production.run({}, body())
  assert.equal(production.request().model, undefined)
  assert.deepEqual(production.request().context, h.request().context)
})
test('guests get public explanation only; rejected authentication never reaches AI', async () => {
  const h = server(intent(), null)
  await h.run({}, body())
  assert.deepEqual(h.request().context.availableActions, ['none'])
  assert.deepEqual(h.request().context.records, [])
  assert.equal(h.request().context.selected, null)
  for (const response of [
    intent('create'),
    intent('read', 'p1'),
    intent('open', 'app-setup'),
  ]) {
    await assert.rejects(server(response, null).run({}, body()), {
      statusCode: 502,
    })
  }
  const denied = server(intent(), new Error('Revoked token'))
  await assert.rejects(denied.run({}, body()), /Revoked token/)
  assert.equal(denied.request(), undefined)
})
test('valid create and App setup proposals; unavailable or unsupported actions fail closed', async () => {
  assert.equal(
    (await server(intent('create')).run({}, body())).action,
    'create'
  )
  assert.equal(
    (await server(intent('open', 'app-setup')).run({}, body())).action,
    'open'
  )
  for (const response of [
    intent('delete', 'p1'),
    intent('update', 'p1'),
    intent('deploy'),
    intent('read', 'other'),
    intent('open', '__proto__'),
    intent('open', 'https://example.com'),
    intent('create', 'p1'),
    intent('none', 'p1'),
    intent('none', '', ''),
    { ...intent(), write: true },
  ]) {
    await assert.rejects(server(response).run({}, body()), { statusCode: 502 })
  }
  const denied = body()
  denied.context.derived.canCreate = false
  await assert.rejects(server(intent('create')).run({}, denied), {
    statusCode: 502,
  })
  denied.context.derived.canPrepareApp = false
  await assert.rejects(server(intent('open', 'app-setup')).run({}, denied), {
    statusCode: 502,
  })
  const stale = body()
  stale.context.selected.id = 'missing'
  await assert.rejects(server(intent('open', 'app-setup')).run({}, stale), {
    statusCode: 502,
  })
  const pending = body()
  pending.context.derived.status = 'pending'
  await assert.rejects(server(intent('read', 'p1')).run({}, pending), {
    statusCode: 502,
  })
  await assert.rejects(
    server(intent(), { uid: 'u1' }, true, false).run({}, body()),
    { statusCode: 502 }
  )
})
test('malformed and oversized requests stop before authentication or AI', async () => {
  for (const invalid of [
    null,
    {},
    { ...body(), prompt: ' ' },
    { ...body(), prompt: 'x'.repeat(2001) },
    { ...body(), context: [] },
    { ...body(), context: { data: 'x'.repeat(24001) } },
  ]) {
    const h = server()
    await assert.rejects(h.run({}, invalid), { statusCode: 400 })
    assert.equal(h.authCalls(), 0)
    assert.equal(h.request(), undefined)
  }
})
