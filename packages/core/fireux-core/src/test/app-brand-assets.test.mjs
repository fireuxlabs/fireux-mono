import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  writeAppAssetFixture,
  testPng,
  testIcon,
} from './fixtures/app-assets.mjs'

const require = createRequire(import.meta.url)
const { createJiti } = require('jiti')
const { inspectAppBrandAssets, assertAppBrandAssets } = await createJiti(
  import.meta.url
).import('../runtime/app/server/onboarding/brand-assets.ts')

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'fireux-assets-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const publicDir = join(root, 'public')
  await writeAppAssetFixture(publicDir)
  const put = (name, data) => writeFile(join(publicDir, 'img/app', name), data)
  const check = async (name) =>
    (await inspectAppBrandAssets(publicDir)).find((entry) =>
      entry.path.endsWith(`/${name}`)
    )
  return { root, publicDir, put, check }
}

test('a complete App family passes without environment or network access', async (t) => {
  const f = await fixture(t)
  const checks = await assertAppBrandAssets(f.publicDir)
  assert.equal(checks.length, 8)
  assert.ok(checks.every((check) => check.ok))
})

test('shared branding cannot satisfy a missing App file', async (t) => {
  const f = await fixture(t)
  await rm(join(f.publicDir, 'img/app/logo.png'))
  await mkdir(join(f.publicDir, 'img/core/brand'), { recursive: true })
  await writeFile(
    join(f.publicDir, 'img/core/brand/logo.png'),
    await testPng(512, 512)
  )
  assert.match((await f.check('logo.png')).reason, /Missing file/)
  await assert.rejects(
    assertAppBrandAssets(f.publicDir),
    /img\/app\/logo.png: Missing file/
  )
})

test('wrong dimensions, disguised formats and truncated PNG data fail', async (t) => {
  const f = await fixture(t)
  await f.put('logo.png', await testPng(1024, 1024))
  assert.match((await f.check('logo.png')).reason, /exactly 512x512/)
  const sharp = require('sharp')
  await f.put(
    'logo.png',
    await sharp(await testPng(512, 512))
      .jpeg()
      .toBuffer()
  )
  assert.match((await f.check('logo.png')).reason, /Must be PNG/)
  const png = await testPng(512, 512)
  await f.put('logo.png', png.subarray(0, 64))
  assert.equal((await f.check('logo.png')).ok, false)
})

test('each favicon size must exist and decode with a matching directory', async (t) => {
  const f = await fixture(t)
  await f.put('favicon.ico', await testPng(64, 64))
  assert.match((await f.check('favicon.ico')).reason, /Must be ICO/)
  await f.put('favicon.ico', await testIcon([16, 32, 48]))
  assert.match(
    (await f.check('favicon.ico')).reason,
    /missing required sizes: 64/
  )
  const mismatched = await testIcon()
  mismatched[6] = 32
  await f.put('favicon.ico', mismatched)
  assert.match((await f.check('favicon.ico')).reason, /dimensions do not match/)
  const outside = await testIcon()
  outside.writeUInt32LE(outside.length + 1, 18)
  await f.put('favicon.ico', outside)
  assert.match((await f.check('favicon.ico')).reason, /outside the file/)
  const overlapping = await testIcon()
  overlapping.writeUInt32LE(overlapping.readUInt32LE(18), 34)
  await f.put('favicon.ico', overlapping)
  assert.match((await f.check('favicon.ico')).reason, /overlap/)
})

test('wordmark variants must share a canvas even when both sizes are individually valid', async (t) => {
  const f = await fixture(t)
  await f.put('wordmark-dark.png', await testPng(1024, 256))
  assert.match((await f.check('wordmark-dark.png')).reason, /same canvas/)
})

function moduleFixture(options) {
  const hooks = new Map(),
    calls = []
  const dependencies = {
    defineNuxtModule: (definition) => definition,
    createResolver: () => ({ resolve: (value) => value }),
    addTemplate: () => {},
    addServerHandler: () => {},
    configurePageTransitions: () => {},
    configureFireuxModule: () => {},
    configureComponents: () => {},
    configureAssets: () => {},
    defaultMaxListeners: 10,
    setMaxListeners: () => {},
    join,
    assertAppBrandAssets: async (directory) => {
      calls.push(directory)
      if (options.invalid) throw new Error('App assets failed')
    },
    createJiti: () => ({
      import: async () => ({
        assertAppBrandAssets: dependencies.assertAppBrandAssets,
      }),
    }),
  }
  const source = readFileSync(new URL('../module.ts', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll(
      'import.meta.url',
      JSON.stringify(new URL('../module.ts', import.meta.url).href)
    )
    .replace('export default ', 'const definition = ')
  const module = compileFunction(
    `${stripTypeScriptTypes(source)}; return definition`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const nuxt = {
    options: {
      dev: options.dev,
      rootDir: '/consumer',
      runtimeConfig: {
        public: { fireux: options.app ? { id: 'consumer' } : {} },
      },
    },
    hook: (name, handler) => hooks.set(name, handler),
  }
  module.setup({}, nuxt)
  return { build: hooks.get('build:before'), calls }
}

test('production App builds fail at the native build hook; development and independent Core stay usable', async () => {
  const app = moduleFixture({ app: true, dev: false, invalid: true })
  await assert.rejects(app.build(), /App assets failed/)
  assert.deepEqual(app.calls, ['/consumer/public'])
  for (const options of [
    { app: true, dev: true },
    { app: false, dev: false },
  ]) {
    const independent = moduleFixture(options)
    await independent.build()
    assert.deepEqual(independent.calls, [])
  }
})
