import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { fileURLToPath } from 'node:url'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const moduleUrl = new URL('../config/app/firebase.ts', import.meta.url)
const source = readFileSync(moduleUrl, 'utf8')
  .replace(/^import\s*\{[\s\S]*?\}\s*from\s*['"]@nuxt\/kit['"]\s*/, '')
  .replace('export default ', 'const moduleDefinition = ')
  .replaceAll('import.meta.url', 'moduleUrl')
const loadModule = compileFunction(
  `${stripTypeScriptTypes(source)}\nreturn moduleDefinition`,
  [
    'defineNuxtModule',
    'createResolver',
    'addPlugin',
    'installModule',
    'process',
    'moduleUrl',
  ]
)

function fixture({ credentials, installError, modules = [], ssr = true } = {}) {
  const env =
    credentials === undefined
      ? {}
      : { GOOGLE_APPLICATION_CREDENTIALS: credentials }
  const plugins = []
  const installations = []
  const resolved = []
  const nuxt = {
    options: {
      dev: false,
      ssr,
      modules,
      vuefire: { auth: { sessionCookie: true } },
      runtimeConfig: {
        public: {
          firebaseEcosystem: {
            firebase: {
              apiKey: 'ecosystem-key',
              authDomain: 'example.test',
              projectId: 'example-project',
              storageBucket: 'example-bucket',
              messagingSenderId: 'example-sender',
            },
          },
          firebaseApp: { apiKey: ' app-key ', appId: ' example-app ' },
        },
      },
    },
  }
  const module = loadModule(
    (definition) => definition,
    (url) => {
      assert.equal(url, moduleUrl.href)
      return {
        resolve(relative) {
          const path = fileURLToPath(new URL(relative, url))
          assert.ok(existsSync(path), `Missing runtime plugin: ${path}`)
          resolved.push(path)
          return path
        },
      }
    },
    (plugin, options) => {
      if (options?.append) plugins.push(plugin)
      else plugins.unshift(plugin)
    },
    async (name) => {
      installations.push({
        name,
        credentials: env.GOOGLE_APPLICATION_CREDENTIALS,
        authEnabled: nuxt.options.vuefire.auth.enabled,
        config: { ...nuxt.options.runtimeConfig.public.vuefire.config },
      })
      if (installError) throw installError
      plugins.push({ src: 'vuefire-server', mode: 'server' })
      plugins.push({ src: 'vuefire-client', mode: 'client' })
    },
    { env },
    moduleUrl.href
  )
  return { module, nuxt, env, plugins, installations, resolved }
}

test('Core configures VueFire before installation and orders its SSR and Auth plugins', async () => {
  const context = fixture()
  await context.module.setup({}, context.nuxt)

  assert.equal(context.module.defaults.authEnabled, true)
  assert.equal(context.installations.length, 1)
  assert.equal(context.installations[0].name, 'nuxt-vuefire')
  assert.equal(context.installations[0].authEnabled, true)
  assert.deepEqual(context.installations[0].config, {
    apiKey: 'app-key',
    authDomain: 'example.test',
    projectId: 'example-project',
    storageBucket: 'example-bucket',
    messagingSenderId: 'example-sender',
    appId: 'example-app',
  })
  assert.equal(context.nuxt.options.vuefire.auth.sessionCookie, true)
  assert.equal(
    context.nuxt.options.vuefire.config,
    context.nuxt.options.runtimeConfig.public.vuefire.config
  )
  assert.deepEqual(
    context.plugins.map((plugin) => plugin.mode),
    ['server', 'server', 'client', 'client']
  )
  assert.ok(
    context.plugins[0].src.endsWith('/firebase-admin-fallback.server.ts')
  )
  assert.equal(context.plugins[1].src, 'vuefire-server')
  assert.equal(context.plugins[2].src, 'vuefire-client')
  assert.ok(
    context.plugins[3].src.endsWith('/firebase-auth-persistence.client.ts')
  )
  assert.equal(context.resolved.length, 2)
})

test('disabling Auth retains SSR Admin setup and omits client persistence', async () => {
  const context = fixture()
  await context.module.setup({ authEnabled: false }, context.nuxt)

  assert.equal(context.installations[0].authEnabled, false)
  assert.equal(context.nuxt.options.vuefire.auth.sessionCookie, true)
  assert.equal(context.plugins.length, 3)
  assert.ok(
    context.plugins[0].src.endsWith('/firebase-admin-fallback.server.ts')
  )
  assert.equal(
    context.plugins.some((plugin) =>
      plugin.src.includes('firebase-auth-persistence')
    ),
    false
  )
})

test('client rendering omits the SSR Admin plugin and appends Auth persistence', async () => {
  const context = fixture({ ssr: false })
  await context.module.setup({}, context.nuxt)

  assert.equal(context.plugins.length, 3)
  assert.equal(
    context.plugins.some((plugin) =>
      plugin.src.includes('firebase-admin-fallback')
    ),
    false
  )
  assert.ok(
    context.plugins.at(-1).src.endsWith('/firebase-auth-persistence.client.ts')
  )
})

for (const credentials of [undefined, '/example/credentials.json']) {
  const state = credentials === undefined ? 'absent' : 'present'
  for (const fails of [false, true]) {
    test(`registration uses a safe credential sentinel and restores ${state} ADC after ${fails ? 'failure' : 'success'}`, async () => {
      const installError = fails ? new Error('installation failed') : undefined
      const context = fixture({ credentials, installError })
      if (fails) {
        await assert.rejects(
          context.module.setup({}, context.nuxt),
          (error) => error === installError
        )
        assert.deepEqual(context.plugins, [])
      } else {
        await context.module.setup({}, context.nuxt)
      }

      assert.equal(
        context.installations[0].credentials,
        '{"fireux_managed":true}'
      )
      assert.equal(context.env.GOOGLE_APPLICATION_CREDENTIALS, credentials)
      assert.equal(
        Object.hasOwn(context.env, 'GOOGLE_APPLICATION_CREDENTIALS'),
        credentials !== undefined
      )
    })
  }
}

for (const registration of ['nuxt-vuefire', ['nuxt-vuefire', { auth: true }]]) {
  test(`direct ${Array.isArray(registration) ? 'tuple' : 'string'} VueFire registration is rejected before installation`, async () => {
    const context = fixture({
      credentials: '/example/credentials.json',
      modules: [registration],
    })
    await assert.rejects(
      context.module.setup({}, context.nuxt),
      /Remove direct nuxt-vuefire registration/
    )
    assert.deepEqual(context.installations, [])
    assert.deepEqual(context.plugins, [])
    assert.equal(
      context.env.GOOGLE_APPLICATION_CREDENTIALS,
      '/example/credentials.json'
    )
  })
}
