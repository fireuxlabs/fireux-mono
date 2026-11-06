import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
function load(file, dependencies, result) {
  const source = readFileSync(file, 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default module\s*$/gm, '')
    .replace(/^export /gm, '')
    .replaceAll(
      'import.meta.url',
      JSON.stringify(new URL(`file://${file}`).href)
    )
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const filterPagesByGlob = load(
  resolve(root, 'packages/core/fireux-core/src/config/module/pages-config.ts'),
  {},
  'filterPagesByGlob'
)

for (const [name, workspace] of [
  ['fireux-fireux', 'project'],
  ['fireux-granite', 'portfolio'],
]) {
  test(`${name} registers Workspace components and commands only when selected`, async () => {
    for (const selected of [false, true]) {
      const source = resolve(root, 'packages/ecosystem', name, 'src')
      const calls = {
        components: false,
        composables: [],
        handlers: [],
        installed: [],
      }
      const module = load(
        resolve(source, 'module.ts'),
        {
          createResolver: () => ({ resolve: (path) => resolve(source, path) }),
          defineNuxtModule: (definition) => definition,
          ecosystemConfig: {},
          configureRuntimeConfig: () => {},
          configureComponents: () => {},
          configureModulePages: () => {},
          configureFireuxEcosystemModule: (_resolver, _nuxt, options) => {
            calls.components = Boolean(options.configureComponents)
          },
          registerComposablesDirs: (_resolver, directories) =>
            calls.composables.push(...directories),
          registerServerHandlers: (_resolver, handlers) =>
            calls.handlers.push(...handlers),
          installModule: async (name) => calls.installed.push(name),
        },
        'module'
      )
      await module.setup(
        {},
        {
          options: {
            runtimeConfig: {
              public: {
                fireux: {
                  workspaces: selected ? [workspace] : [],
                  modules: [],
                },
              },
            },
          },
        }
      )
      assert.equal(calls.components, selected)
      if (workspace === 'project') {
        assert.equal(calls.composables.length, selected ? 1 : 0)
        assert.equal(calls.handlers.length, selected ? 2 : 0)
        assert.equal(
          new Set(calls.handlers.map((handler) => handler.route)).size,
          calls.handlers.length
        )
        for (const handler of calls.handlers) {
          assert.ok(existsSync(resolve(source, handler.handler + '.ts')))
          assert.ok(!handler.handler.includes('/server/api/'))
        }
      } else {
        assert.deepEqual(
          calls.installed,
          selected
            ? [
                'fireux-properties',
                'fireux-compliance',
                'fireux-documents',
                'fireux-tasks',
              ]
            : []
        )
      }
    }
  })
}

for (const [name, workspace] of [
  ['fireux-fireux', 'project'],
  ['fireux-misebox', 'kitchen'],
]) {
  test(`${name} filters only its unselected Workspace pages from a native layer`, () => {
    const source = resolve(root, 'packages/ecosystem', name, 'src')
    for (const selected of [false, true]) {
      let nativeChecks = 0
      const hooks = []
      const configure = load(
        resolve(source, 'config/module/pages-config.ts'),
        {
          configurePages: () => {
            nativeChecks++
          },
          filterPagesByGlob,
        },
        'configureModulePages'
      )
      configure(
        { resolve: (path) => resolve(source, path) },
        {
          options: {
            runtimeConfig: {
              public: { fireux: { workspaces: selected ? [workspace] : [] } },
            },
          },
          hook: (name, callback) => {
            assert.equal(name, 'pages:extend')
            hooks.push(callback)
          },
        }
      )
      const pages = [
        {
          file: resolve(
            source,
            `runtime/pages/workspace/${workspace}/index.vue`
          ),
        },
        { file: resolve(source, 'runtime/pages/diagnostics/index.vue') },
        {
          file: resolve(
            root,
            `projects/fixture/app/pages/workspace/${workspace}/index.vue`
          ),
        },
      ]
      for (const hook of hooks) hook(pages)
      assert.equal(nativeChecks, selected ? 1 : 0)
      assert.equal(pages.length, selected ? 3 : 2)
      assert.ok(pages.some((page) => page.file.includes('/projects/fixture/')))
      assert.ok(pages.some((page) => page.file.includes('/diagnostics/')))
    }
  })
}

test('Shared ecosystem wiring publishes each ecosystem asset directory once', () => {
  const configure = load(
    resolve(
      root,
      'packages/core/fireux-core/src/config/module/ecosystem-wiring.ts'
    ),
    {
      existsSync,
      setRuntimeFirebaseEcosystem: () => {},
      configurePages: () => {},
      registerLayoutComponents: () => {},
      registerComposablesDir: () => {},
    },
    'configureFireuxEcosystemModule'
  )
  for (const name of [
    'bringli',
    'buenohost',
    'fireux',
    'granite',
    'misebox',
    'sharer',
    'slap',
    'werkbox',
  ]) {
    const source = resolve(root, `packages/ecosystem/fireux-${name}/src`)
    const resolver = { resolve: (path) => resolve(source, path) }
    const nuxt = {
      options: { nitro: { publicAssets: [{ dir: '/app-owned/assets' }] } },
    }
    const options = {
      ecosystem: {
        id: name,
        name,
        description: '',
        ssr: { region: 'europe-west1' },
        firebase: { databaseId: name },
      },
    }
    configure(resolver, nuxt, options)
    configure(resolver, nuxt, options)
    assert.deepEqual(nuxt.options.nitro.publicAssets, [
      { dir: '/app-owned/assets' },
      { dir: resolve(source, 'runtime/public') },
    ])
  }
})
