import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function loadAppRead(name, dependencies) {
  const code = readFileSync(
    new URL(
      '../../../../../packages/core/fireux-core/src/runtime/app/server/collection/read.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function reader({ invalid = false, forbidden = false } = {}) {
  const queries = []
  const code = readFileSync(
    new URL('../../server/project/apps/read.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const database = (name, docs) => ({
    collection(collection) {
      return {
        where(field, operator, value) {
          queries.push([name, collection, field, operator, value])
          return {
            get: async () => ({ docs }),
            orderBy: () => ({ get: async () => ({ docs }) }),
          }
        },
      }
    },
  })
  const dependencies = {
    createError: (input) =>
      Object.assign(new Error(input.statusMessage), input),
    requireProjectOperator: async () => {
      if (forbidden) throw new Error('Forbidden')
      return {
        projectId: 'project-a',
        db: database('identity', [{ id: 'ecosystem-a' }]),
      }
    },
    PLATFORM_DIRECTORY_TARGETS: [
      {
        ecosystemId: 'ecosystem-a',
        projectId: 'firebase-a',
        databaseId: 'named-a',
      },
    ],
    getFirestoreProjectDb: async (project, name) => {
      assert.equal(project, 'firebase-a')
      assert.equal(name, 'named-a')
      return database(name, [
        { id: 'app-a', data: () => ({ name: 'Example' }) },
      ])
    },
    readAppRecords: loadAppRead('readAppRecords', {
      FieldPath: { documentId: () => '__name__' },
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      readAppDocument: (data, id) => (invalid ? null : { ...data, id }),
    }),
    appCollectionPage: loadAppRead('appCollectionPage', {
      createError: (input) => new Error(input.statusMessage),
    }),
  }
  return {
    queries,
    read: compileFunction(
      `${stripTypeScriptTypes(code)}; return readProjectApps`,
      Object.keys(dependencies)
    )(...Object.values(dependencies)),
  }
}

test('Project Apps queries only selected Project Ecosystems and matching Apps', async () => {
  const { read, queries } = reader()
  const result = await read({}, 'project-a')
  assert.deepEqual(queries, [
    ['identity', 'ecosystems', 'project_id', '==', 'project-a'],
    ['named-a', 'apps', 'ecosystem_id', '==', 'ecosystem-a'],
  ])
  assert.equal(result.project_id, 'project-a')
  assert.equal(result.items[0].id, 'app-a')
})

test('Invalid App does not become a misleading empty collection', async () => {
  await assert.rejects(
    reader({ invalid: true }).read({}, 'project-a'),
    /invalid stored shape/
  )
})

test('Project authorization precedes all collection queries', async () => {
  const { read, queries } = reader({ forbidden: true })
  await assert.rejects(read({}, 'project-a'), /Forbidden/)
  assert.deepEqual(queries, [])
})

test('App creation input requires an explicit role and rejects caller infrastructure', () => {
  const code = readFileSync(
    new URL('../../server/project/apps/create.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const parse = compileFunction(
    `${stripTypeScriptTypes(code)}; return projectAppInput`,
    ['createError']
  )((input) => new Error(input.statusMessage))
  const input = {
    id: 'personal-showcase',
    name: 'Daniel',
    description: '',
    ecosystem_id: 'fireux',
  }
  assert.throws(() => parse(input), /role/)
  assert.equal(parse({ ...input, role: 'tenant' }).role, 'tenant')
  assert.equal(parse({ ...input, role: 'standalone' }).role, 'standalone')
  assert.throws(
    () => parse({ ...input, role: 'tenant', databaseId: 'other' }),
    /Unsupported/
  )
})

test('HTML preview escapes saved presentation instead of executing it', () => {
  const code = readFileSync(
    new URL(
      '../../../../../packages/core/fireux-core/src/runtime/app/utils/renderAppPreview.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const render = compileFunction(
    `${stripTypeScriptTypes(code)}; return renderAppPreview`
  )()
  const html = render({
    name: '<script>bad()</script>',
    description: '<img onerror="bad()">',
  })
  assert.equal(html.includes('<script>'), false)
  assert.equal(html.includes('<img'), false)
  assert.match(html, /&lt;script&gt;/)
})
