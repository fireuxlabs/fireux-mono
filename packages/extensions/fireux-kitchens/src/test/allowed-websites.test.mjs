import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(path, names, dependencies = {}) {
  const source = readFileSync(
    new URL(`../runtime/${path}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const origins = load(
  'kitchen/utils/allowed-websites',
  'normalizeAllowedWebsites,readAllowedWebsites,websiteFrameAncestors'
)
const headers = load(
  'kitchen/utils/embedding-response',
  'embeddingResponseHeaders,embeddingNeedsDocumentNavigation'
)
test('origins normalize, deduplicate and keep www and ports explicit', () => {
  assert.deepEqual(
    origins.normalizeAllowedWebsites([
      'https://EXAMPLE.com/',
      'https://example.com:443',
      'https://www.example.com',
      'https://example.com:8443',
    ]),
    [
      'https://example.com',
      'https://www.example.com',
      'https://example.com:8443',
    ]
  )
  assert.equal(
    origins.websiteFrameAncestors(['https://example.com']),
    "frame-ancestors 'self' https://example.com"
  )
})
test('reject paths, wildcards, credentials, malformed hosts and CSP injection', () => {
  for (const origin of [
    'example.com',
    '*',
    'https://*.example.com',
    'https://example.com/menu',
    'https://example.com/.',
    'https://example.com?x=1',
    'https://example.com#x',
    'https://user:pass@example.com',
    'https://example.com.',
    'https://example.com;',
    'https://example.com,evil.test',
    'https://example.com\nframe-ancestors *',
    'https://example.com\\evil',
    'https://example.com%3b',
    'https://bad_host.example',
    "https://example.com'",
    'javascript:alert(1)',
    'http://example.com',
  ])
    assert.throws(
      () => origins.normalizeAllowedWebsites([origin]),
      undefined,
      origin
    )
  assert.throws(() =>
    origins.normalizeAllowedWebsites(Array(21).fill('https://example.com'))
  )
})
test('missing and invalid policy fail closed; local HTTP is development-only', () => {
  assert.deepEqual(origins.readAllowedWebsites(undefined), [])
  assert.equal(
    origins.websiteFrameAncestors(undefined),
    "frame-ancestors 'self'"
  )
  assert.equal(
    origins.websiteFrameAncestors(['https://good.example', '*']),
    "frame-ancestors 'self'"
  )
  assert.throws(() =>
    origins.normalizeAllowedWebsites(['http://localhost:4311'])
  )
  assert.deepEqual(
    origins.normalizeAllowedWebsites(['http://localhost:4311'], true),
    ['http://localhost:4311']
  )
  assert.equal(
    origins.websiteFrameAncestors([
      'http://localhost:4311',
      'https://example.com',
    ]),
    "frame-ancestors 'self' https://example.com"
  )
  assert.equal(
    origins.websiteFrameAncestors(['http://localhost:4311'], true),
    "frame-ancestors 'self' http://localhost:4311"
  )
  assert.throws(() =>
    origins.normalizeAllowedWebsites(['http://localhost.attacker.test'], true)
  )
})
test('response preserves independent CSP restrictions and prevents HTML policy caching', () => {
  const result = headers.embeddingResponseHeaders(
    {
      'Content-Security-Policy': "script-src 'self'",
      'Cache-Control': 'public,max-age=3600',
      'content-type': 'text/html',
    },
    "frame-ancestors 'self' https://example.com",
    "default-src 'self'"
  )
  assert.equal(
    result['content-security-policy'],
    "default-src 'self', script-src 'self', frame-ancestors 'self' https://example.com"
  )
  assert.equal(result['cache-control'], 'private, no-store')
  assert.equal(result['content-type'], 'text/html')
  assert.equal(result['Cache-Control'], undefined)
})
test('framed route changes reload policy but hydration and ordinary top-level navigation do not loop', () => {
  const input = {
    framed: true,
    hydrating: false,
    fromPath: '/kitchens/a',
    toPath: '/kitchens/b/order',
  }
  assert.equal(headers.embeddingNeedsDocumentNavigation(input), true)
  assert.equal(
    headers.embeddingNeedsDocumentNavigation({ ...input, hydrating: true }),
    false
  )
  assert.equal(
    headers.embeddingNeedsDocumentNavigation({ ...input, framed: false }),
    false
  )
  assert.equal(
    headers.embeddingNeedsDocumentNavigation({
      ...input,
      fromPath: input.toPath,
    }),
    false
  )
})
function integrationHarness({ authorized = true, exists = false } = {}) {
  const writes = []
  const module = load(
    'kitchen/server/integrations/website-ordering',
    'updateKitchenAllowedWebsites',
    {
      ...origins,
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      requireFirestoreDocumentId: (value) => {
        if (typeof value !== 'string' || !value || value.includes('/'))
          throw new Error('Bad id')
        return value
      },
      readKitchenMutationActor: async () => ({ uid: 'operator' }),
      requireKitchenMutationAuthority: async (_, actor, kitchenId) => {
        assert.equal(kitchenId, 'venue')
        if (!authorized) throw new Error('Denied')
      },
      serverKitchenIntegrationsTarget: (id) =>
        'kitchens/' + id + '/integrations',
      runGuardedServerTransaction: async (_, callback) =>
        callback({
          read: async () => ({ exists }),
          create: (...args) => writes.push(args),
          update: (...args) => writes.push(args),
        }),
    }
  )
  return { ...module, writes }
}
test('website settings use exact Kitchen authority and the existing integration target', async () => {
  for (const exists of [true, false]) {
    const h = integrationHarness({ exists })
    await h.updateKitchenAllowedWebsites(
      {},
      { kitchenId: 'venue', allowed_origins: ['https://EXAMPLE.com/'] }
    )
    assert.deepEqual(h.writes, [
      [
        'kitchens/venue/integrations',
        'website-ordering',
        { allowed_origins: ['https://example.com'] },
      ],
    ])
  }
})
test('denied access and unsafe settings cannot write; clearing is explicit', async () => {
  for (const [settings, body] of [
    [
      { authorized: false },
      { kitchenId: 'venue', allowed_origins: ['https://example.com'] },
    ],
    [{}, { kitchenId: 'venue', allowed_origins: ['*'] }],
    [{}, { kitchenId: 'venue', allowed_origins: [], extra: true }],
  ]) {
    const h = integrationHarness(settings)
    await assert.rejects(h.updateKitchenAllowedWebsites({}, body))
    assert.equal(h.writes.length, 0)
  }
  const h = integrationHarness()
  await h.updateKitchenAllowedWebsites(
    {},
    { kitchenId: 'venue', allowed_origins: [] }
  )
  assert.deepEqual(h.writes[0][2], { allowed_origins: [] })
})
test('HTML policy resolves the exact menu owner, directory Kitchen or tenant and fails closed on read errors', async () => {
  const reads = []
  const apply = load(
    'kitchen/server/integrations/embedding-policy',
    'applyKitchenEmbeddingPolicy',
    {
      ...origins,
      ...headers,
      getResponseHeader: (event) => event.headers?.csp,
      setResponseHeader: (event, key, value) => {
        ;(event.headers ||= {})[key] = value
      },
      resolveMenuTarget: async (menu, slug) => {
        assert.equal(menu, 'food')
        assert.equal(slug, 'venue')
        return { kitchenId: 'menu-owner' }
      },
      resolveDirectoryMenuScope: async () => ({ kitchenId: 'directory-owner' }),
      resolveTenantMenuScope: async () => ({ kitchenId: 'tenant-owner' }),
      readKitchenAllowedWebsites: async (id) => {
        reads.push(id)
        if (id === 'tenant-owner') throw new Error('unavailable')
        return ['https://example.com']
      },
    }
  ).applyKitchenEmbeddingPolicy
  for (const target of [
    { menuId: 'food', kitchenSlug: 'venue' },
    { kitchenSlug: 'venue' },
    {},
  ]) {
    const event = { context: {}, headers: { csp: "script-src 'self'" } }
    await apply(event, target)
    assert.equal(event.headers['Cache-Control'], 'private, no-store')
    assert.ok(
      event.headers['Content-Security-Policy'].includes("script-src 'self'")
    )
    assert.equal(
      event.context.kitchenFrameAncestors,
      target.kitchenSlug
        ? "frame-ancestors 'self' https://example.com"
        : "frame-ancestors 'self'"
    )
  }
  assert.deepEqual(reads, ['menu-owner', 'directory-owner', 'tenant-owner'])
})

test('workspace live reads require exact App and Kitchen access before reading origins', async () => {
  let authorized = true
  let reads = 0
  const { readWorkspaceKitchenAllowedWebsites } = load(
    'kitchen/server/integrations/website-ordering',
    'readWorkspaceKitchenAllowedWebsites',
    {
      ...origins,
      requireFirestoreDocumentId: (value) => {
        assert.equal(value, 'venue')
        return value
      },
      readKitchenMutationActor: async () => ({
        uid: 'operator',
        runtimeAppId: 'app',
      }),
      requireKitchenWriterAccount: async (input, uid) => {
        assert.deepEqual(input, { appId: 'app', kitchenId: 'venue' })
        assert.equal(uid, 'operator')
        if (!authorized) throw new Error('Denied')
      },
      getRuntimeFirestore: () => ({
        doc: (path) => {
          assert.equal(path, 'kitchens/venue/integrations/website-ordering')
          reads++
          return {
            get: async () => ({
              exists: true,
              data: () => ({ allowed_origins: ['https://example.com'] }),
            }),
          }
        },
      }),
    }
  )
  assert.deepEqual(await readWorkspaceKitchenAllowedWebsites({}, 'venue'), {
    kitchenId: 'venue',
    allowed_origins: ['https://example.com'],
  })
  authorized = false
  await assert.rejects(
    readWorkspaceKitchenAllowedWebsites({}, 'venue'),
    /Denied/
  )
  assert.equal(reads, 1)
})
