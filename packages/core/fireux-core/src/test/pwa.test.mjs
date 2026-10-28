import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

class Worker extends EventTarget {
  scriptURL = 'https://app.example/sw.js'
  state = 'installing'
  messages = []
  postMessage(value) {
    this.messages.push(value)
  }
  transition(state) {
    this.state = state
    this.dispatchEvent(new Event('statechange'))
  }
}

class Registration extends EventTarget {
  scope = 'https://app.example/'
  installing = new Worker()
  active = null
  waiting = null
  removed = false
  updates = 0
  async unregister() {
    this.removed = true
    return true
  }
  async update() {
    this.updates += 1
  }
}

function fixture({
  enabled = false,
  blockedStorage = false,
  blockedPreferenceRead = false,
} = {}) {
  const values = new Map(enabled ? [['fireux:pwa:bike', '1']] : [])
  const writes = []
  const cacheKeys = new Set()
  const deletedCaches = []
  const registrations = []
  const registration = new Registration()
  const calls = []
  const media = Object.assign(new EventTarget(), { matches: false })
  let reloads = 0
  const serviceWorker = Object.assign(new EventTarget(), {
    controller: null,
    async getRegistrations() {
      return registrations.filter((item) => !item.removed)
    },
    async register(url, options) {
      calls.push({ url, options })
      if (!registrations.includes(registration))
        registrations.push(registration)
      return registration
    },
  })
  const cacheStorage = {
    async keys() {
      return [...cacheKeys]
    },
    async delete(key) {
      deletedCaches.push(key)
      return cacheKeys.delete(key)
    },
  }
  const window = Object.assign(new EventTarget(), {
    isSecureContext: true,
    matchMedia: () => media,
    location: {
      origin: 'https://app.example',
      reload() {
        reloads += 1
      },
    },
    caches: cacheStorage,
  })
  const navigator = {
    onLine: true,
    userAgent: 'Chrome',
    platform: 'test',
    maxTouchPoints: 0,
    serviceWorker,
  }
  const localStorage = {
    getItem: (key) => {
      if (blockedPreferenceRead) throw new Error('blocked')
      return values.get(key) ?? null
    },
    setItem(key, value) {
      if (blockedStorage) throw new Error('blocked')
      writes.push(key)
      values.set(key, value)
    },
    removeItem: (key) => values.delete(key),
  }
  const create = load(
    '../runtime/composables/pwa/controller.ts',
    'createPwaController',
    {
      ref,
      window,
      navigator,
      localStorage,
      caches: cacheStorage,
    }
  )
  const pwa = create({ appId: 'bike', baseURL: '/', production: true })
  return {
    pwa,
    window,
    navigator,
    media,
    values,
    writes,
    cacheKeys,
    deletedCaches,
    registrations,
    registration,
    calls,
    get reloads() {
      return reloads
    },
  }
}

test('a fresh visit and native install prompt create no worker, preference or cache', async () => {
  const f = fixture()
  f.cacheKeys.add('another-feature-cache')
  await f.pwa.start()
  assert.equal(f.calls.length, 0)
  assert.deepEqual(f.writes, [])
  assert.deepEqual(f.deletedCaches, [])
  let prompted = false
  const event = Object.assign(
    new Event('beforeinstallprompt', { cancelable: true }),
    {
      prompt() {
        prompted = true
        return Promise.resolve({ outcome: 'dismissed' })
      },
    }
  )
  f.window.dispatchEvent(event)
  assert.equal(event.defaultPrevented, true)
  assert.equal(f.pwa.canInstall.value, true)
  const result = f.pwa.install()
  assert.equal(
    prompted,
    true,
    'prompt stays within synchronous user activation'
  )
  await result
  assert.equal(f.pwa.installed.value, false, 'dismissal is not an installation')
  f.window.dispatchEvent(new Event('appinstalled'))
  assert.equal(
    f.pwa.installed.value,
    false,
    'installation does not turn this browser tab into an installed window'
  )
  f.media.matches = true
  f.media.dispatchEvent(new Event('change'))
  assert.equal(f.pwa.installed.value, true)
  assert.equal(f.calls.length, 0)
  assert.deepEqual(f.writes, [])
  f.window.dispatchEvent(new Event('offline'))
  assert.equal(f.pwa.online.value, false)
  f.pwa.dispose()
  f.window.dispatchEvent(new Event('online'))
  assert.equal(
    f.pwa.online.value,
    false,
    'disposed listeners cannot change state'
  )
})

test('offline enablement, readiness and removal are limited to the App owner', async () => {
  const f = fixture()
  await f.pwa.start()
  await f.pwa.enableOffline()
  assert.deepEqual(f.calls, [
    {
      url: 'https://app.example/sw.js',
      options: { scope: 'https://app.example/', updateViaCache: 'none' },
    },
  ])
  assert.equal(f.values.get('fireux:pwa:bike'), '1')
  assert.equal(f.pwa.offlineEnabled.value, true)
  assert.equal(f.pwa.offlineReady.value, false)
  f.registration.installing.transition('installed')
  assert.equal(f.pwa.offlineReady.value, true)
  f.cacheKeys.add('fireux-bike-precache-v2-https://app.example/')
  f.cacheKeys.add('another-feature-cache')
  const other = new Registration()
  other.scope = 'https://app.example/another/'
  f.registrations.push(other)
  await f.pwa.disableOffline()
  assert.equal(f.registration.removed, true)
  assert.equal(other.removed, false)
  assert.equal(f.values.has('fireux:pwa:bike'), false)
  assert.equal(f.pwa.offlineEnabled.value, false)
  assert.deepEqual([...f.cacheKeys], ['another-feature-cache'])
  f.pwa.dispose()
})

test('updates wait for a user action and reload only after controller activation', async () => {
  const f = fixture({ enabled: true })
  f.registration.active = new Worker()
  f.registration.waiting = new Worker()
  f.navigator.serviceWorker.controller = f.registration.active
  await f.pwa.start()
  assert.equal(f.pwa.updateAvailable.value, true)
  assert.deepEqual(f.registration.waiting.messages, [])
  f.pwa.dismissUpdate()
  assert.equal(f.pwa.updateAvailable.value, false)
  await f.pwa.checkForUpdate()
  assert.equal(f.pwa.updateAvailable.value, true)
  f.navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
  assert.equal(f.reloads, 0)
  f.pwa.applyUpdate()
  assert.deepEqual(f.registration.waiting.messages, [{ type: 'SKIP_WAITING' }])
  assert.equal(f.reloads, 0)
  f.navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
  assert.equal(f.reloads, 1)
  f.registration.waiting.transition('activated')
  assert.equal(f.reloads, 1, 'activation and controller events reload only once')
  f.pwa.dispose()
})

test('a resumed waiting worker can complete an explicit update without controllerchange', async () => {
  const f = fixture({ enabled: true })
  f.registration.active = new Worker()
  f.registration.waiting = new Worker()
  f.registration.waiting.state = 'installed'
  f.navigator.serviceWorker.controller = f.registration.active
  await f.pwa.start()
  f.pwa.applyUpdate()
  f.registration.waiting.transition('activating')
  assert.equal(f.reloads, 0)
  f.registration.waiting.transition('activated')
  assert.equal(f.reloads, 1)
  f.navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
  assert.equal(f.reloads, 1)
  f.pwa.dispose()

  const removed = fixture({ enabled: true })
  removed.registration.active = new Worker()
  removed.registration.waiting = new Worker()
  await removed.pwa.start()
  removed.pwa.applyUpdate()
  await removed.pwa.disableOffline()
  removed.registration.waiting.transition('activated')
  removed.navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
  assert.equal(removed.reloads, 0, 'removal cancels a pending update reload')
  removed.pwa.dispose()
})

test('legacy automatic Core workers are removed without touching other registrations or storage', async () => {
  const f = fixture({ blockedPreferenceRead: true })
  f.registrations.push(f.registration)
  const other = new Registration()
  other.installing.scriptURL = 'https://app.example/other-worker.js'
  f.registrations.push(other)
  f.cacheKeys.add('workbox-precache-v2-https://app.example/')
  f.cacheKeys.add('another-feature-cache')
  await f.pwa.start()
  assert.equal(f.registration.removed, true)
  assert.equal(other.removed, false)
  assert.deepEqual([...f.cacheKeys], ['another-feature-cache'])
  assert.equal(f.calls.length, 0)
  f.pwa.dispose()
})

test('blocked storage and failed worker installation never claim offline readiness', async () => {
  const blocked = fixture({ blockedStorage: true })
  await blocked.pwa.start()
  await blocked.pwa.enableOffline()
  assert.equal(blocked.calls.length, 0)
  assert.equal(blocked.pwa.offlineEnabled.value, false)
  assert.ok(blocked.pwa.error.value)
  blocked.pwa.dispose()
  const failed = fixture()
  await failed.pwa.start()
  await failed.pwa.enableOffline()
  failed.registration.installing.transition('redundant')
  assert.equal(failed.pwa.offlineReady.value, false)
  assert.equal(failed.pwa.offlineEnabled.value, false)
  assert.equal(failed.values.has('fireux:pwa:bike'), false)
  assert.ok(failed.pwa.error.value)
  failed.pwa.dispose()
})

test('generated worker policy preserves network navigation and excludes private content', async () => {
  const workerLocation = { origin: 'https://app.example', pathname: '/sw.js' }
  const configure = load('../config/app/pwa.ts', 'configPwa', {
    resolveFireuxBrandAssets: () => ({}),
    self: { location: workerLocation },
  })
  const nuxt = {}
  configure(nuxt, { id: 'bike', themeColor: '#fff' })
  const { pwa } = nuxt
  assert.equal(pwa.injectRegister, false)
  assert.equal(pwa.client.registerPlugin, false)
  assert.equal(pwa.workbox.navigateFallback, null)
  assert.equal(pwa.workbox.skipWaiting, false)
  assert.equal(pwa.workbox.runtimeCaching[0].handler, 'NetworkOnly')
  const route = pwa.workbox.runtimeCaching[0].urlPattern
  for (const path of ['/api/private', '/auth', '/__/auth/handler'])
    assert.equal(
      route({
        request: { mode: 'navigate' },
        url: new URL(path, 'https://app.example'),
      }),
      false
    )
  assert.equal(
    route({
      request: { mode: 'navigate' },
      url: new URL('/workspace/project', 'https://app.example'),
    }),
    true
  )
  assert.equal(
    route({
      request: { mode: 'cors' },
      url: new URL('/api/private', 'https://app.example'),
    }),
    false
  )
  assert.equal(
    route({
      request: { mode: 'navigate' },
      url: new URL('https://external.example/'),
    }),
    false
  )
  const manifest = await pwa.workbox.manifestTransforms[0]([
    { url: 'fireux-offline.html', revision: 'one' },
    { url: 'index.html', revision: 'two' },
    { url: 'workspace/_payload.json', revision: 'three' },
    { url: '_nuxt/builds/latest.json', revision: 'four' },
  ])
  assert.deepEqual(manifest.manifest, [
    { url: 'fireux-offline.html', revision: 'one' },
  ])
  assert.equal(
    pwa.workbox.runtimeCaching[0].options.precacheFallback.fallbackURL,
    'fireux-offline.html'
  )
  workerLocation.pathname = '/apps/bike/sw.js'
  assert.equal(
    route({
      request: { mode: 'navigate' },
      url: new URL('https://app.example/apps/bike/auth'),
    }),
    false
  )
})
