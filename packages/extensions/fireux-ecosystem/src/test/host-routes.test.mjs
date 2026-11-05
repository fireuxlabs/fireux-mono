import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { loadNuxt, build } from 'nuxt'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const coreRuntime = path.join(root, 'packages/core/fireux-core/src/runtime')
const hostRuntime = fileURLToPath(new URL('../runtime/', import.meta.url))

test('Only the Ecosystem host layer registers App directory pages and APIs', async (t) => {
  mkdirSync(path.join(root, 'temp'), { recursive: true })
  const directory = mkdtempSync(path.join(root, 'temp/ecosystem-host-proof-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))

  for (const enabled of [false, true]) {
    const cwd = path.join(directory, enabled ? 'host' : 'core')
    mkdirSync(cwd)
    const nuxt = await loadNuxt({
      cwd,
      ready: true,
      overrides: {
        _prepare: true,
        dev: false,
        ssr: false,
        pages: true,
        telemetry: false,
        extends: [coreRuntime, ...(enabled ? [hostRuntime] : [])],
      },
    })

    try {
      await build(nuxt)
      const pages = []
      const visit = (entries) => {
        for (const entry of entries || []) {
          if (/^\/apps(?:\/|$)/.test(entry.path)) pages.push(entry)
          visit(entry.children)
        }
      }
      visit(nuxt.apps.default.pages)
      const handlers = [
        ...nuxt._nitro.scannedHandlers,
        ...nuxt._nitro.options.handlers,
      ].filter((entry) => /^\/api\/apps(?:\/|$)/.test(entry.route || ''))
      const home = nuxt.apps.default.components.filter(
        (entry) => entry.pascalName === 'FireLandingEcosystemHome'
      )

      if (!enabled) {
        assert.deepEqual(pages, [])
        assert.deepEqual(handlers, [])
        assert.deepEqual(home, [])
        continue
      }

      assert.deepEqual(pages.map((entry) => entry.path).sort(), [
        '/apps',
        '/apps/:id()',
        '/apps/create',
      ])
      for (const entry of pages) {
        assert.ok(entry.file.startsWith(hostRuntime))
      }
      assert.deepEqual(
        handlers
          .map(({ route, method }) => ({ route, method }))
          .sort((a, b) => a.route.localeCompare(b.route)),
        [
          { route: '/api/apps', method: 'get' },
          { route: '/api/apps/:id', method: 'get' },
        ]
      )
      for (const entry of handlers) {
        assert.ok(entry.handler.startsWith(hostRuntime))
      }
      assert.equal(home.length, 1)
      assert.equal(
        home[0].filePath,
        path.join(hostRuntime, 'components/landing/EcosystemHome.vue')
      )
    } finally {
      await nuxt.close()
    }
  }
})
