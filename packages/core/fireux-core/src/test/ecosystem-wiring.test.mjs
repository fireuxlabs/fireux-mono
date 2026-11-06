import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

for (const [lane, name, workspace] of [
  ['ecosystem', 'fireux-fireux', 'project'],
  ['ecosystem', 'fireux-granite', 'portfolio'],
  ['extensions', 'fireux-projects', 'project'],
]) {
  test(`${name} registers Workspace components and commands only when selected`, async () => {
    for (const selected of [false, true]) {
      const source = resolve(root, 'packages', lane, name, 'src')
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
          configureFireuxModule: (resolver, _nuxt, steps) => {
            calls.components = Boolean(steps.components)
            steps.composables?.(resolver)
            steps.server?.(resolver)
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
      assert.equal(
        calls.components,
        name === 'fireux-fireux' ? false : selected
      )
      if (name === 'fireux-fireux') {
        assert.deepEqual(calls.installed, selected ? ['fireux-projects'] : [])
        assert.equal(calls.handlers.length, 0)
      } else if (workspace === 'project') {
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
  ['fireux-projects', 'project'],
  ['fireux-misebox', 'kitchen'],
]) {
  test(`${name} filters only its unselected Workspace pages from a native layer`, () => {
    const source = resolve(
      root,
      name === 'fireux-projects' ? 'packages/extensions' : 'packages/ecosystem',
      name,
      'src'
    )
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
  const ecosystemRoot = resolve(root, 'packages/ecosystem')
  for (const name of readdirSync(ecosystemRoot)) {
    const source = resolve(ecosystemRoot, name, 'src')
    if (!existsSync(resolve(source, 'runtime/public'))) continue
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

test('An ecosystem with bindings and assets alone does not require a page layer', () => {
  const configure = load(
    resolve(
      root,
      'packages/core/fireux-core/src/config/module/ecosystem-wiring.ts'
    ),
    {
      existsSync: (path) => path.endsWith('/runtime/public'),
      setRuntimeFirebaseEcosystem: () => {},
      configurePages: () => {
        throw Error('Unowned page layer was required')
      },
      registerLayoutComponents: () => {},
      registerComposablesDir: () => {},
    },
    'configureFireuxEcosystemModule'
  )
  const nuxt = { options: {} }
  configure({ resolve: (path) => resolve('/ecosystem/src', path) }, nuxt, {
    ecosystem: {
      id: 'fixture',
      name: 'Fixture',
      description: '',
      ssr: { region: 'europe-west1' },
      firebase: { databaseId: 'fixture' },
    },
  })
  assert.deepEqual(nuxt.options.nitro.publicAssets, [
    { dir: '/ecosystem/src/runtime/public' },
  ])
})
