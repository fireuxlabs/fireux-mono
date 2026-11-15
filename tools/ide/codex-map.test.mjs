import assert from 'node:assert/strict'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { buildCodexMap, renderCodexMap, runCodexMap } from './codex-map.mjs'

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'fireux-codex-map-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const put = (file, value = '') => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    writeFileSync(
      path.join(root, file),
      typeof value === 'string' ? value : JSON.stringify(value)
    )
  }
  put('package.json', {
    name: 'fireux',
    scripts: { 'dev:venue': 'pnpm --dir projects/misebox/venue dev' },
  })
  put(
    'pnpm-workspace.yaml',
    "packages:\n  - 'packages/core/*'\n  - 'packages/ecosystem/*'\n  - 'packages/extensions/*'\n  - 'projects/*/*'\n  - 'tools/*'\n"
  )
  put('AGENTS.md')
  put('docs/ai/gpt-context.md')
  put('docs/concepts/fireux-mono.md')
  put('packages/core/fireux-core/package.json', { name: 'fireux-core' })
  put('packages/core/fireux-core/src/module.ts')
  put('packages/core/fireux-core/src/runtime/user/models/model.ts')
  put('packages/core/fireux-core/src/runtime/user/composables/read.ts')
  put('packages/extensions/fireux-kitchens/package.json', {
    name: 'fireux-kitchens',
    dependencies: { 'fireux-core': 'workspace:*' },
  })
  put(
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/recipe/models/model.ts'
  )
  put(
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/recipe/server/create.ts'
  )
  put(
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/preparation/models/model.ts'
  )
  put(
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Menu/Services/Index.vue'
  )
  put('docs/concepts/kitchen.md')
  put(
    'packages/extensions/fireux-kitchens/docs/ai/kitchen-context.md',
    '[Kitchen map](../../../../../docs/concepts/kitchen.md#recipe)'
  )
  put('packages/ecosystem/fireux-misebox/package.json', {
    name: 'fireux-misebox',
    dependencies: { 'fireux-kitchens': 'workspace:*' },
  })
  put('packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md')
  put('projects/misebox/venue/package.json', {
    name: 'venue-app',
    scripts: { dev: 'nuxi dev --port 3001', typecheck: 'nuxi typecheck' },
    dependencies: {
      'fireux-misebox': 'workspace:*',
      'fireux-kitchens': 'workspace:*',
    },
  })
  put('projects/misebox/venue/nuxt.config.ts')
  put('projects/misebox/no-port/package.json', { name: 'no-port-app' })
  put('projects/templates/starter/package.json', { name: 'starter-app' })
  put('projects/templates/starter/nuxt.config.ts')
  put('projects/fireux/no-fireux-embed-test/firebase.json', {})
  put('tools/ide/check.mjs')
  put('tools/ide/sample.test.mjs')
  put('tools/release/cli.mjs')
  put('tools/named/package.json', { name: 'named-tool' })
  put('tools/scripts-parked/old/README.md')
  return { root, put }
}

test('map covers every manifest, no-port/template Apps, tools without manifests and the static harness', (t) => {
  const { root } = fixture(t)
  const map = buildCodexMap(root)
  assert.deepEqual(map.counts, {
    repository: 1,
    library: 3,
    app: 3,
    tool: 4,
    'static-project': 1,
  })
  const byPath = new Map(map.scopes.map((scope) => [scope.path, scope]))
  assert.equal(byPath.get('projects/templates/starter').workspaceMember, true)
  assert.equal(byPath.get('projects/misebox/no-port').devServer, undefined)
  assert.equal(
    byPath.get('projects/fireux/no-fireux-embed-test').workspaceMember,
    false
  )
  assert.equal(
    byPath.get('projects/fireux/no-fireux-embed-test').checkOwner,
    '.'
  )
  assert.equal(byPath.get('tools/release').name, 'release')
  assert.equal(byPath.get('tools/release').manifest, null)
  assert.deepEqual(byPath.get('tools/release').entrypoints, [
    'tools/release/cli.mjs',
  ])
  assert.equal(byPath.get('tools/named').name, 'named-tool')
  assert.equal(byPath.get('tools/scripts-parked').state, 'parked')
  assert.equal(byPath.get('.').name, 'fireux')
  assert.equal(byPath.get('.').taskPrefix, path.basename(root))
  assert.equal(map.taskOverlayProvided, false)
  assert.ok(map.scopes.every((scope) => scope.taskState === 'no active task'))
})

test('source identity, contexts, relationships and runnable-App enrichment come from current source', (t) => {
  const { root, put } = fixture(t)
  let map = buildCodexMap(root)
  const kitchen = map.scopes.find((scope) => scope.name === 'fireux-kitchens')
  const app = map.scopes.find((scope) => scope.name === 'venue-app')
  assert.deepEqual(kitchen.dependencies, ['fireux-core'])
  assert.deepEqual(kitchen.sourceMaps, ['docs/concepts/kitchen.md'])
  assert.deepEqual(kitchen.contexts, [
    'packages/extensions/fireux-kitchens/docs/ai/kitchen-context.md',
  ])
  assert.ok(kitchen.consumers.includes('projects/misebox/venue'))
  assert.deepEqual(app.relatedContexts, [
    'packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md',
    'packages/extensions/fireux-kitchens/docs/ai/kitchen-context.md',
  ])
  assert.equal(app.devServer.port, 3001)
  assert.equal(app.devServer.devScript, 'dev:venue')
  assert.equal(app.scripts.typecheck, 'nuxi typecheck')
  assert.deepEqual(
    app.checks.find((check) => check.kind === 'typecheck'),
    {
      kind: 'typecheck',
      command: 'node',
      args: ['tools/ide/check.mjs', 'typecheck', 'projects/misebox/venue'],
      cwd: '.',
    }
  )
  put('projects/misebox/venue/package.json', {
    name: 'renamed-venue',
    scripts: { dev: 'nuxi dev --port 3101' },
  })
  map = buildCodexMap(root)
  assert.equal(
    map.scopes.find((scope) => scope.path === 'projects/misebox/venue').name,
    'renamed-venue'
  )
  assert.equal(
    map.scopes.find((scope) => scope.name === 'renamed-venue').devServer.port,
    3101
  )
})

test('thread overlay binds exact owners, allows disjoint outcomes and cannot manufacture a source spine', (t) => {
  const { root } = fixture(t)
  const map = buildCodexMap(root, {
    threads: {
      pinnedThreads: [
        {
          id: 'one',
          title: 'fireux-kitchens / recipe — save a recipe',
          status: { type: 'active' },
        },
      ],
      threads: [
        { id: 'one', title: 'fireux-kitchens / recipe — save a recipe' },
        {
          id: 'two',
          title: 'fireux-kitchens / preparation — edit preparation',
          status: 'idle',
        },
        {
          id: 'three',
          title: 'fireux-kitchens / service — investigate old finding',
        },
        { id: 'four', title: 'fireux-kitchens-extra — not the same owner' },
        {
          id: 'five',
          title: 'Any display title',
          ownerPath: 'projects/misebox/venue',
        },
        { id: 'old', title: 'fireux-kitchens — finished', archived: true },
      ],
    },
  })
  const kitchen = map.scopes.find((scope) => scope.name === 'fireux-kitchens')
  assert.equal(kitchen.tasks.length, 3)
  assert.equal(
    kitchen.tasks[0].scopePath,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/recipe'
  )
  assert.equal(
    kitchen.tasks[1].scopePath,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/preparation'
  )
  assert.equal(kitchen.tasks[2].scopePath, null)
  assert.equal(kitchen.tasks[0].status, 'active')
  assert.ok(!kitchen.spines.some((spine) => spine.scope.includes('service')))
  assert.ok(!kitchen.spines.some((spine) => spine.scope.includes('components')))
  assert.equal(
    map.scopes.find((scope) => scope.name === 'venue-app').tasks[0].id,
    'five'
  )
  assert.deepEqual(
    map.unmatchedThreads.map((task) => task.id),
    ['four']
  )
})

test('ambiguous manifest names and malformed exports do not silently assign a task', (t) => {
  const { root, put } = fixture(t)
  put('tools/another/package.json', { name: 'fireux-core' })
  const map = buildCodexMap(root, {
    threads: [{ id: 'one', title: 'fireux-core — outcome' }],
  })
  assert.equal(map.unmatchedThreads[0].reason, 'Ambiguous owner name')
  assert.throws(() => buildCodexMap(root, { threads: {} }), /Thread export/)
})

test('concept source links connect exact sections and ancestors to existing file owners', (t) => {
  const { root, put } = fixture(t)
  put('packages/extensions/fireux-kitchens/src/config.ts')
  put(
    'docs/concepts/composition.md',
    `# Composition

## App selection
[App](../../projects/misebox/venue/nuxt.config.ts)
### Builder
[Builder](../../packages/extensions/fireux-kitchens/src/config.ts)
[Repeated](../../packages/extensions/fireux-kitchens/src/config.ts#options)
## Other selection
[Core](../../packages/core/fireux-core/src/module.ts)
`
  )
  const map = buildCodexMap(root)
  const concept = (anchor = '') =>
    map.concepts.find(
      (node) => node.id === `docs/concepts/composition.md${anchor}`
    )
  assert.deepEqual(concept('#app-selection').sourceLinks, [
    {
      path: 'packages/extensions/fireux-kitchens/src/config.ts',
      ownerPath: 'packages/extensions/fireux-kitchens',
    },
    {
      path: 'projects/misebox/venue/nuxt.config.ts',
      ownerPath: 'projects/misebox/venue',
    },
  ])
  assert.deepEqual(concept('#builder').ownerPaths, [
    'packages/extensions/fireux-kitchens',
  ])
  assert.deepEqual(concept('#other-selection').ownerPaths, [
    'packages/core/fireux-core',
  ])
  assert.equal(concept().sourceLinks.length, 3)
  assert.deepEqual(concept('#builder').sourceLinks, [
    {
      path: 'packages/extensions/fireux-kitchens/src/config.ts',
      ownerPath: 'packages/extensions/fireux-kitchens',
    },
  ])
  const html = renderCodexMap(map)
  assert.ok(html.includes('Referenced source files'))
  assert.ok(
    html.includes(`${root}/packages/extensions/fireux-kitchens/src/config.ts`)
  )
})

test('source relationships exclude missing, external, escaped and fenced example links', (t) => {
  const { root, put } = fixture(t)
  const outside = mkdtempSync(path.join(os.tmpdir(), 'codex-map-outside-'))
  t.after(() => rmSync(outside, { recursive: true, force: true }))
  writeFileSync(path.join(outside, 'external.ts'), '')
  symlinkSync(
    path.join(outside, 'external.ts'),
    path.join(root, 'packages/core/fireux-core/external.ts')
  )
  put(
    'docs/concepts/composition.md',
    `# Composition
## Selection
[Missing](../../packages/core/fireux-core/missing.ts)
[External](https://example.com/packages/core/fireux-core/src/module.ts)
[Symlink](../../packages/core/fireux-core/external.ts)
[Directory](../../packages/core/fireux-core)
[Bad encoding](../../packages/core/fireux-core/%zz)
[Doc](fireux-mono.md)
~~~md
## Example heading
[Example](../../packages/core/fireux-core/src/module.ts)
~~~
\`\`\`md
[Another example](../../projects/misebox/venue/nuxt.config.ts)
\`\`\`
`
  )
  const map = buildCodexMap(root)
  const nodes = map.concepts.filter(
    (node) => node.path === 'docs/concepts/composition.md'
  )
  assert.equal(nodes.length, 2)
  assert.ok(
    nodes.every(
      (node) => node.sourceLinks.length === 0 && node.ownerPaths.length === 0
    )
  )
})

test('HTML is self-contained, escapes source/task content and exposes missing overlay limits', (t) => {
  const { root } = fixture(t)
  const html = renderCodexMap(
    buildCodexMap(root, {
      threads: [
        { id: 'one', title: 'fireux-kitchens — <script>alert("x")</script>' },
      ],
    })
  )
  assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'))
  assert.ok(!html.includes('<script>alert('))
  assert.ok(!/<(?:script|link|img)\b[^>]*(?:src|href)=["']https?:/i.test(html))
  assert.ok(html.includes('data-search='))
  assert.ok(
    renderCodexMap(buildCodexMap(root)).includes(
      'live task state unknown; no export supplied'
    )
  )
})

test('CLI is read-only by default and writes only an explicit selected output', (t) => {
  const { root, put } = fixture(t)
  const messages = []
  const map = runCodexMap([], { root, report: (value) => messages.push(value) })
  assert.equal(JSON.parse(messages[0]).scopes.length, map.scopes.length)
  put('threads.json', [{ id: 'one', title: 'venue-app — verify routes' }])
  const output = path.join(root, 'reports/map.html')
  runCodexMap(
    ['--threads', path.join(root, 'threads.json'), '--output', output],
    { root, report: () => {} }
  )
  assert.ok(readFileSync(output, 'utf8').includes('venue-app — verify routes'))
  assert.throws(
    () => runCodexMap(['--output', path.join(root, 'map.md')], { root }),
    /\.json or \.html/
  )
  assert.throws(() => runCodexMap(['--threads'], { root }), /Use --threads/)
})
