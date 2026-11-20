import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { getLayerDirectories } from '@nuxt/kit'
import { build, loadNuxt } from 'nuxt'

const core = fileURLToPath(new URL('../../', import.meta.url))
const repository = fileURLToPath(new URL('../../../../../', import.meta.url))
const scratch = mkdtempSync(
  join(realpathSync(tmpdir()), 'fireux-core-installation-')
)
const installed = join(scratch, 'node_modules/fireux-core')

before(() => {
  execFileSync('pnpm', ['pack', '--pack-destination', scratch], { cwd: core })
  const archive = readdirSync(scratch).find((file) => file.endsWith('.tgz'))
  mkdirSync(installed, { recursive: true })
  execFileSync('tar', [
    '-xzf',
    join(scratch, archive),
    '--strip-components=1',
    '-C',
    installed,
  ])
  symlinkSync(
    join(core, 'node_modules'),
    join(installed, 'node_modules'),
    'dir'
  )
})

after(() => rmSync(scratch, { recursive: true, force: true }))

async function prepare(cwd, buildDir) {
  const nuxt = await loadNuxt({
    cwd,
    ready: false,
    overrides: {
      _prepare: true,
      buildDir,
      dev: false,
      telemetry: false,
      vuefire: { emulators: { enabled: false } },
    },
  })
  let nitro
  nuxt.hook('nitro:init', (instance) => {
    nitro = instance
  })
  try {
    await nuxt.ready()
    await build(nuxt)
    const app = nuxt.apps.default
    return {
      layers: getLayerDirectories(nuxt).map((layer) =>
        realpathSync(layer.root)
      ),
      pages: app.pages.map((page) => page.path),
      layouts: Object.keys(app.layouts),
      middleware: app.middleware.map(({ name }) => name),
      components: app.components.map(({ pascalName }) => pascalName),
      imports: readFileSync(join(buildDir, 'imports.d.ts'), 'utf8'),
      handlers: [...nitro.scannedHandlers, ...nitro.options.handlers],
      workspaces: nuxt.options.runtimeConfig.public.fireux?.workspaces,
    }
  } finally {
    await nuxt.close()
  }
}

function hasHandler(result, route, method) {
  return result.handlers.some(
    (handler) =>
      handler.route === route && handler.method?.toUpperCase() === method
  )
}

function assertCoreRegistration(result, { module, layer }) {
  assert.equal(result.pages.includes('/workspace'), layer)
  assert.equal(result.layouts.includes('workspace'), layer)
  assert.equal(result.middleware.includes('fireux-workspace-global'), layer)
  assert.equal(result.components.includes('FirePwaStatus'), layer)
  assert.equal(hasHandler(result, '/api/app/status', 'GET'), layer)
  assert.equal(
    hasHandler(result, '/api/internal/app/membership', 'POST'),
    layer
  )

  for (const name of ['FireuxApp', 'WorkspaceSidebar']) {
    assert.equal(result.components.includes(name), module, name)
  }
  for (const name of ['useAppUserRead', 'useUserRead', 'useWorkspace']) {
    assert.equal(result.imports.includes(name), module, name)
  }
  assert.equal(hasHandler(result, '/manifest.webmanifest', 'GET'), module)
  assert.equal(
    result.handlers.some(({ route }) => route === '/robots.txt'),
    module
  )
  assert.equal(
    result.handlers.some(({ route }) => route === '/sitemap.xml'),
    module
  )
}

for (const [name, module, layer] of [
  ['module only', true, false],
  ['layer only', false, true],
  ['module and layer', true, true],
]) {
  test(`the packed Core package registers its ${name} contract`, async () => {
    const cwd = mkdtempSync(join(scratch, 'host-'))
    const config = {
      extends: layer ? ['fireux-core/layer'] : [],
      modules: module ? ['fireux-core'] : [],
      modulesDir: [
        join(scratch, 'node_modules'),
        join(repository, 'node_modules'),
      ],
      pages: true,
    }
    writeFileSync(
      join(cwd, 'nuxt.config.mjs'),
      `export default ${JSON.stringify(config)}`
    )
    const result = await prepare(cwd, join(cwd, '.nuxt'))
    assert.equal(
      result.layers.includes(join(installed, 'src/runtime')),
      layer,
      result.layers.join(', ')
    )
    assertCoreRegistration(result, { module, layer })
  })
}

test('packed Core production config exports can be imported by Node', () => {
  const exports = ['app', 'module'].flatMap((group) =>
    readdirSync(join(installed, 'dist/config', group))
      .filter((file) => file.endsWith('.mjs'))
      .map((file) => `fireux-core/config/${group}/${file.slice(0, -4)}`)
  )
  assert.ok(exports.includes('fireux-core/config/app/runtime'))
  assert.ok(exports.includes('fireux-core/config/module/ecosystem-wiring'))
  execFileSync(
    process.execPath,
    [
      '--conditions=production',
      '--input-type=module',
      '--eval',
      `
    import assert from 'node:assert/strict'
    for (const specifier of ${JSON.stringify(exports)}) {
      assert.match(import.meta.resolve(specifier), /\\/dist\\/config\\/.+\\.mjs$/)
      await import(specifier)
    }
  `,
    ],
    { cwd: scratch, stdio: 'pipe' }
  )
})

for (const [name, workspaces, path] of [
  ['go-qr', [], '/pricing'],
  ['fireux-blank', ['blank'], '/workspace/blank/overview'],
]) {
  test(`${name} composes Core with its selected Workspace families`, async () => {
    const cwd = join(repository, 'projects/fireux', name)
    const previousCwd = process.cwd()
    const previousEnv = process.env
    process.env = {
      ...previousEnv,
      APP_DOMAIN: 'localhost',
      NUXT_FIREBASE_APP_ID: 'fireux-installation-test',
    }
    process.chdir(cwd)
    try {
      const result = await prepare(cwd, join(scratch, name))
      assertCoreRegistration(result, { module: true, layer: true })
      assert.deepEqual(result.workspaces, workspaces)
      assert.ok(result.pages.includes(path), path)
      if (!workspaces.length) {
        assert.deepEqual(
          result.pages.filter((route) => route.startsWith('/workspace')),
          ['/workspace']
        )
      }
    } finally {
      process.chdir(previousCwd)
      process.env = previousEnv
    }
  })
}
