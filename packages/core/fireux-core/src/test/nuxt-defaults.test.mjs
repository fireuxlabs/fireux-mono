import assert from 'node:assert/strict'
import test from 'node:test'
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { loadNuxt, build } from 'nuxt'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const source = readFileSync(
  new URL('../config/module/pages-config.ts', import.meta.url),
  'utf8'
)
  .replace(/^import .*\n/gm, '')
  .replace(/^export /gm, '')
const configurePageTransitions = compileFunction(
  `${stripTypeScriptTypes(source)};return configurePageTransitions`
)()

test('layered App source, native viewport, public assets and metadata timing preserve FireUX route policy', async () => {
  const fixture = mkdtempSync(join(tmpdir(), 'fireux-native-defaults-'))
  let nuxt
  let publicAssets = []
  try {
    mkdirSync(join(fixture, 'app/pages'), { recursive: true })
    mkdirSync(join(fixture, 'public'))
    mkdirSync(join(fixture, 'layer/pages'), { recursive: true })
    mkdirSync(join(fixture, 'app/layouts'))
    writeFileSync(
      join(fixture, 'layer/nuxt.config.ts'),
      `export default { srcDir: '.' }`
    )
    writeFileSync(
      join(fixture, 'layer/pages/from-layer.vue'),
      '<template><p>Layer</p></template>'
    )
    writeFileSync(
      join(fixture, 'app/layouts/framework.vue'),
      '<template><div><slot /></div></template>'
    )
    symlinkSync(
      join(root, 'projects/templates/fireux-template/node_modules'),
      join(fixture, 'node_modules'),
      'dir'
    )
    writeFileSync(join(fixture, 'package.json'), '{"type":"module"}')
    writeFileSync(
      join(fixture, 'public/native-proof.txt'),
      'App-owned public asset'
    )
    writeFileSync(
      join(fixture, 'app/pages/index.vue'),
      `<template><p>Public page</p></template>`
    )
    writeFileSync(
      join(fixture, 'app/pages/account.vue'),
      `<template><p>Account</p></template><script setup>definePageMeta({ layout: 'dashboard' })</script>`
    )
    writeFileSync(
      join(fixture, 'app/pages/workspace.vue'),
      `<template><p>Workspace</p></template><script setup>definePageMeta({ layout: false, workspacePage: true, nav: { key: 'workspace-fixture' } })</script>`
    )
    writeFileSync(
      join(fixture, 'nuxt.config.ts'),
      `import { configureNuxtRuntimeDefaults } from ${JSON.stringify(fileURLToPath(new URL('../config/app/nuxt-defaults.ts', import.meta.url)))}
const config = { extends: ['./layer'] }
configureNuxtRuntimeDefaults(config)
export default config
`
    )
    nuxt = await loadNuxt({
      cwd: fixture,
      ready: true,
      overrides: {
        _prepare: true,
        dev: false,
        ssr: false,
        pages: true,
        telemetry: false,
        devtools: { enabled: false },
        future: { compatibilityVersion: 5 },
        modules: [
          function (_options, nuxt) {
            configurePageTransitions(nuxt)
            nuxt.hook('nitro:config', (config) => {
              publicAssets = config.publicAssets || []
            })
          },
        ],
      },
    })
    await build(nuxt)
    assert.equal(nuxt.options.srcDir, join(fixture, 'app'))
    assert.equal(nuxt.options.experimental.scanPageMeta, 'after-resolve')
    assert.equal(
      nuxt.options.app.head.meta.filter((item) => item.name === 'viewport')
        .length,
      1
    )
    assert.equal(
      nuxt.options.app.head.meta.find((item) => item.name === 'viewport')
        .content,
      'width=device-width, initial-scale=1'
    )
    assert.match(
      readFileSync(join(nuxt.options.buildDir, 'types/layouts.d.ts'), 'utf8'),
      /framework:/
    )
    const pages = nuxt.apps.default.pages
    assert.ok(pages.some((page) => page.path === '/from-layer'))
    const account = pages.find((page) => page.path === '/account')
    const workspace = pages.find((page) => page.path === '/workspace')
    assert.equal(account.meta.layout, 'dashboard')
    assert.equal(account.meta.pageTransition, false)
    assert.equal(workspace.meta.workspacePage, true)
    assert.equal(workspace.meta.nav.key, 'workspace-fixture')
    assert.equal(workspace.meta.pageTransition, false)
    const assets = publicAssets.filter(
      (asset) => resolve(asset.dir) === join(fixture, 'public')
    )
    assert.equal(assets.length, 1)
  } finally {
    await nuxt?.close()
    rmSync(fixture, { recursive: true, force: true })
  }
})
