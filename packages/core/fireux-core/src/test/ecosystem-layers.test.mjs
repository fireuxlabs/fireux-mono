import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from 'nuxt'
import { getLayerDirectories } from '@nuxt/kit'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const layer = (name, lane = 'extensions') =>
  join(root, 'packages', lane, `fireux-${name}`, 'src/runtime/nuxt.config.ts')
const core = layer('core', 'core')
for (const [ecosystem, family, domains, coreFirst] of [
  ['fireux', 'project', ['projects'], false],
  ['misebox', 'kitchen', ['kitchens'], false],
  ['buenohost', 'property', ['properties', 'reservations'], true],
  ['bringli', 'supplier', ['suppliers'], true],
  [
    'granite',
    'portfolio',
    ['properties', 'compliance', 'documents', 'tasks'],
    true,
  ],
]) {
  test(`${ecosystem} native composition preserves effective runtime layer precedence`, async () => {
    const fixture = mkdtempSync(join(tmpdir(), 'fireux-ecosystem-layers-'))
    mkdirSync(join(fixture, 'app'))
    const domainLayers = [
      ...domains.map((name) => layer(name)),
      layer(ecosystem, 'ecosystem'),
    ]
    const composition = join(
      root,
      'packages/ecosystem',
      `fireux-${ecosystem}`,
      `src/config/app/${family}-layer.ts`
    )
    const before = coreFirst ? [core, ...domainLayers] : [...domainLayers, core]
    const after = coreFirst ? [core, composition] : [composition, core]
    const actual = []
    try {
      for (const layers of [before, after]) {
        writeFileSync(
          join(fixture, 'nuxt.config.ts'),
          `export default { srcDir: 'app', extends: ${JSON.stringify(layers)} }`
        )
        const nuxt = await loadNuxt({
          cwd: fixture,
          ready: false,
          overrides: {
            dev: false,
            telemetry: false,
            devtools: { enabled: false },
          },
        })
        try {
          actual.push(
            getLayerDirectories(nuxt)
              .map((item) => item.root)
              .filter((path) => path.endsWith('/src/runtime/'))
          )
        } finally {
          await nuxt.close()
        }
      }
      assert.deepEqual(actual[1], actual[0])
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })
}
