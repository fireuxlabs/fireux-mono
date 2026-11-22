import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
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
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { getLayerDirectories } from '@nuxt/kit'
import { build, loadNuxt } from 'nuxt'
import { verifyCoreAccountJourney } from './fixtures/core-account-journey.mjs'

const core = fileURLToPath(new URL('../../', import.meta.url))
const repository = fileURLToPath(new URL('../../../../../', import.meta.url))
const scratch = mkdtempSync(
  join(realpathSync(tmpdir()), 'fireux-core-installation-')
)
const installed = join(scratch, 'node_modules/fireux-core')
// The strict installation suite also runs the localhost emulator journey.
const verifyCoreOnly = process.env.FIREUX_VERIFY_CORE_ONLY === '1'

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
  if (verifyCoreOnly) {
    const { dependencies } = JSON.parse(
      readFileSync(join(installed, 'package.json'), 'utf8')
    )
    for (const name of Object.keys(dependencies)) {
      assert.ok(!name.startsWith('fireux-'), `Core depends on ${name}`)
      const target = join(scratch, 'node_modules', name)
      mkdirSync(dirname(target), { recursive: true })
      symlinkSync(join(core, 'node_modules', name), target, 'dir')
    }
    for (const name of ['nuxt', 'vue', '@nuxt/ui']) {
      const target = join(scratch, 'node_modules', name)
      mkdirSync(dirname(target), { recursive: true })
      symlinkSync(join(repository, 'node_modules', name), target, 'dir')
    }
  }
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
      css: nuxt.options.css,
      workspaceNativeFiles: [
        ...app.pages
          .filter(({ path }) => ['/workspace', '/dashboard/workspace'].includes(path))
          .map(({ file }) => file),
        app.layouts.workspace?.file,
        ...app.middleware
          .filter(({ name }) => name.includes('workspace'))
          .map(({ path }) => path),
      ]
        .filter(Boolean)
        .map((file) => realpathSync(file)),
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
  assert.equal(result.components.includes('FirePwaStatus'), layer)
  assert.equal(result.layouts.includes('dashboard'), layer)
  assert.equal(hasHandler(result, '/api/app/status', 'GET'), layer)
  assert.equal(
    hasHandler(result, '/api/internal/app/membership', 'POST'),
    layer
  )

  assert.equal(result.components.includes('FireuxApp'), module)
  for (const name of ['useAppUserRead', 'useUserRead']) {
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

function assertWorkspaceRegistration(result, { selected }) {
  assert.equal(result.pages.includes('/workspace'), selected)
  assert.equal(result.layouts.includes('workspace'), selected)
  assert.equal(result.middleware.includes('fireux-workspace-global'), selected)
  const runtime = join(
    repository,
    'packages/extensions/fireux-workspace/src/runtime'
  )
  const nativeFiles = [
    'layouts/workspace.vue',
    'middleware/fireux-workspace.global.ts',
    'pages/dashboard/workspace.vue',
    'pages/workspace/index.vue',
  ].map((file) => join(runtime, file))
  assert.deepEqual(result.workspaceNativeFiles.sort(), selected ? nativeFiles : [])
  if (selected) {
    assert.ok(result.css.includes(join(runtime, 'assets/styles/workspace.css')))
    assert.ok(!result.css.includes('fireux-core/runtime/assets/styles/main.css'))
    assert.ok(result.middleware.includes('fireux-auth-global'))
    assert.ok(
      result.middleware.indexOf('fireux-workspace-global') <
        result.middleware.indexOf('fireux-auth-global')
    )
  }
  assert.equal(result.components.includes('WorkspaceSidebar'), selected)
  assert.equal(/\buseWorkspace\b/.test(result.imports), selected)
  assert.equal(hasHandler(result, '/workspace.webmanifest', 'GET'), selected)
}

function coreWorkspaceImports() {
  const runtime = join(installed, 'src/runtime')
  return readdirSync(runtime, { recursive: true })
    .filter(
      (path) => !path.startsWith('workspace/') && /\.(ts|vue)$/.test(path)
    )
    .filter((path) =>
      /\b(?:from\s+|import\s*\(?\s*)['"](?:fireux-workspace(?=[/'"])|[^'"]*\/workspace\/)/.test(
        readFileSync(join(runtime, path), 'utf8')
      )
    )
    .sort()
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
    assertWorkspaceRegistration(result, { selected: false })
  })

  if (verifyCoreOnly) {
    test(`Core without Workspace prepares as ${name}`, async () => {
      const cwd = mkdtempSync(join(scratch, 'core-only-'))
      const configPath = join(cwd, 'nuxt.config.mjs')
      writeFileSync(
        configPath,
        `export default ${JSON.stringify({
          extends: layer ? ['fireux-core/layer'] : [],
          modules: module ? ['fireux-core'] : [],
          modulesDir: [join(scratch, 'node_modules')],
          pages: true,
        })}`
      )
      assert.throws(
        () => createRequire(configPath).resolve('fireux-workspace'),
        { code: 'MODULE_NOT_FOUND' }
      )
      const result = await prepare(cwd, join(cwd, '.nuxt'))
      assert.equal(
        result.layers.includes(join(installed, 'src/runtime')),
        layer
      )
      assertCoreRegistration(result, { module, layer })
      assert.deepEqual(
        {
          pages: result.pages.filter((path) =>
            /^\/(?:dashboard\/)?workspace(?:\/|$)/.test(path)
          ),
          layouts: result.layouts.filter((name) => name === 'workspace'),
          middleware: result.middleware.filter((name) =>
            name.includes('workspace')
          ),
          components: result.components.filter((name) =>
            /^Workspace(?=[A-Z])/.test(name)
          ),
          imports: result.imports
            .split('\n')
            .filter((line) =>
              /runtime\/workspace\/|\buseWorkspace\w*\b/.test(line)
            )
            .map((line) => line.split(' from ')[0]),
          handlers: result.handlers.filter(
            ({ route }) =>
              route === '/workspace.webmanifest' ||
              route?.startsWith('/api/workspace')
          ),
          runtimeImports: coreWorkspaceImports(),
          bundledRuntime: existsSync(join(installed, 'src/runtime/workspace')),
        },
        {
          pages: [],
          layouts: [],
          middleware: [],
          components: [],
          imports: [],
          handlers: [],
          runtimeImports: [],
          bundledRuntime: false,
        }
      )
    })
  }
}

if (verifyCoreOnly) {
  test('Core without Workspace completes the authenticated account journey', async () => {
    await verifyCoreAccountJourney({
      cwd: mkdtempSync(join(scratch, 'core-account-')),
      modulesDir: join(scratch, 'node_modules'),
      nuxtCli: join(repository, 'node_modules/nuxt/bin/nuxt.mjs'),
    })
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
      assertWorkspaceRegistration(result, {
        selected: workspaces.length > 0,
      })
      assert.deepEqual(result.workspaces, workspaces)
      assert.ok(result.pages.includes(path), path)
      if (!workspaces.length) {
        assert.deepEqual(
          result.pages.filter((route) => route.startsWith('/workspace')),
          []
        )
      }
    } finally {
      process.chdir(previousCwd)
      process.env = previousEnv
    }
  })
}
