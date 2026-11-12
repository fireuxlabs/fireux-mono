import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { loadNuxt, build } from 'nuxt'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const core = path.join(root, 'packages/core/fireux-core/src/runtime')
const app = fileURLToPath(new URL('../runtime/', import.meta.url))
const publicRoute = /^\/(?:legal|operations|solutions|tools)(?:\/|$)/

test('The App layer supplies public presentation without adding commercial surfaces to bare Core', async (t) => {
  mkdirSync(path.join(root, 'temp'), { recursive: true })
  const directory = mkdtempSync(path.join(root, 'temp/app-public-proof-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))

  for (const enabled of [false, true]) {
    const cwd = path.join(directory, enabled ? 'app' : 'core')
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
        extends: [core, ...(enabled ? [app] : [])],
      },
    })
    try {
      await build(nuxt)
      const pages = []
      const visit = (entries) => {
        for (const entry of entries || []) {
          if (publicRoute.test(entry.path)) pages.push(entry)
          visit(entry.children)
        }
      }
      visit(nuxt.apps.default.pages)
      const handlers = [
        ...nuxt._nitro.scannedHandlers,
        ...nuxt._nitro.options.handlers,
      ].filter((entry) =>
        /^\/api\/app\/(operations|solutions)$/.test(entry.route || '')
      )
      const components = nuxt.apps.default.components.filter((entry) =>
        /^(AppPricing|FireLegal|FireLanding)/.test(entry.pascalName)
      )
      if (!enabled) {
        assert.deepEqual(pages, [])
        assert.deepEqual(handlers, [])
        assert.deepEqual(components, [])
        continue
      }
      assert.deepEqual(pages.map((entry) => entry.path).sort(), [
        '/legal',
        '/operations',
        '/operations/:slug()',
        '/solutions',
        '/solutions/:slug()',
        '/tools',
        '/tools/core',
      ])
      for (const entry of pages) assert.ok(entry.file.startsWith(app))
      assert.deepEqual(
        handlers.map(({ route, method }) => [route, method]).sort(),
        [
          ['/api/app/operations', 'get'],
          ['/api/app/solutions', 'get'],
        ]
      )
      for (const entry of handlers) assert.ok(entry.handler.startsWith(app))
      for (const name of [
        'AppPricingPage',
        'AppPricingCatalogue',
        'AppPricingTier',
        'FireLegalDocuments',
        'FireLegalAppNotices',
        'FireLegalBrowserStorage',
        'FireLegalPrivacyPolicy',
        'FireLegalTermsOfService',
        'FireLandingProductIndex',
        'FireLandingProductPricingStrip',
        'FireLandingPricingStrip',
        'FireLandingWorkspacePreviewFrame',
      ]) {
        const registered = components.filter(
          (entry) => entry.pascalName === name
        )
        assert.equal(registered.length, 1, name)
        assert.ok(registered[0].filePath.startsWith(app), name)
      }
      assert.ok(
        !components.some((entry) =>
          /(?:DirectoryHome|AppCollection)$/.test(entry.pascalName)
        )
      )
      assert.ok(
        nuxt.options.css.includes(path.join(app, 'assets/styles/main.scss'))
      )
      assert.ok(
        nuxt.options.imports.dirs.includes(
          path.join(app, 'app/composables/pricing')
        )
      )
    } finally {
      await nuxt.close()
    }
  }
})
