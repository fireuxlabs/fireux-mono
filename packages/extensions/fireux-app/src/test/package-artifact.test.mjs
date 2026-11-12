import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

for (const name of ['fireux-app', 'fireux-ecosystem']) {
  test(`${name} ships its production configuration and owned runtime`, () => {
    const root = fileURLToPath(new URL(`../../../${name}/`, import.meta.url))
    const temporary = mkdtempSync(join(tmpdir(), 'fireux-bundle-'))
    try {
      execFileSync('pnpm', ['pack', '--pack-destination', temporary], {
        cwd: root,
        stdio: 'pipe',
      })
      const archive = readdirSync(temporary).find((file) =>
        file.endsWith('.tgz')
      )
      assert.ok(archive)
      execFileSync('tar', ['-xzf', join(temporary, archive), '-C', temporary])
      const packed = join(temporary, 'package')
      const manifest = JSON.parse(
        readFileSync(join(packed, 'package.json'), 'utf8')
      )
      assert.equal(manifest.name, name)
      const entry = resolve(packed, manifest.exports['./config'].production)
      assert.ok(existsSync(entry))
      execFileSync(process.execPath, ['--check', entry])
      const source = readFileSync(entry, 'utf8')
      for (const match of source.matchAll(/from ['"](\.{1,2}\/[^'"]+)['"]/g)) {
        assert.ok(existsSync(resolve(dirname(entry), match[1])), match[1])
      }
      if (name === 'fireux-app') {
        for (const dependency of [
          'fireux-core',
          'fireux-blogs',
          'fireux-products',
          'fireux-ai',
        ]) {
          assert.equal(manifest.dependencies[dependency], '0.1.0')
        }
        assert.ok(existsSync(resolve(packed, manifest.exports['./layer'])))
        for (const file of [
          'app/composables/pricing/usePricing.ts',
          'app/components/Pricing/Page.vue',
          'components/landing/ProductIndex.vue',
          'composables/landing/useLandingMotion.ts',
          'composables/landing/landing-sticky-motion.ts',
          'components/Legal/Documents.vue',
          'pages/legal/index.vue',
          'pages/operations/[slug].vue',
          'pages/solutions/[slug].vue',
          'pages/tools/index.vue',
          'server/api/app/operations.get.ts',
          'server/api/app/solutions.get.ts',
          'assets/styles/main.scss',
          'assets/styles/scss/organisms/landing-hero.scss',
          'assets/styles/scss/organisms/landing-index-sections.scss',
        ]) {
          assert.ok(existsSync(join(packed, 'src/runtime', file)), file)
        }
      } else {
        assert.equal(manifest.dependencies['fireux-app'], '0.1.0')
        assert.ok(existsSync(resolve(packed, manifest.exports['./layer'])))
        for (const file of [
          'pages/apps/index.vue',
          'pages/apps/[id].vue',
          'pages/apps/create.vue',
          'server/api/apps/index.get.ts',
          'server/api/apps/[id].get.ts',
        ]) {
          assert.ok(existsSync(join(packed, 'src/runtime', file)), file)
        }
      }
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  })
}
