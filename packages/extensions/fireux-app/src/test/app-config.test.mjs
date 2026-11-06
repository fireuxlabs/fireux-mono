import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('App bundles resolve their own defaults and retain watches for indirect dependencies', () => {
  const repository = fileURLToPath(new URL('../../../../../', import.meta.url))
  const fixture = mkdtempSync(join(tmpdir(), 'fireux-app-consumer-'))
  try {
    // Exercise delivered ESM configuration without starting Nuxt or an SDK.
    execFileSync(
      process.execPath,
      [join(repository, 'packages/core/fireux-core/build/config.mjs')],
      { stdio: 'pipe' }
    )
    for (const name of ['fireux-app', 'fireux-ecosystem']) {
      execFileSync(
        process.execPath,
        [join(repository, 'tools/package-config/build.mjs')],
        {
          cwd: join(repository, 'packages/extensions', name),
          stdio: 'pipe',
        }
      )
    }
    mkdirSync(join(fixture, 'node_modules'))
    writeFileSync(join(fixture, 'package.json'), '{"type":"module"}')
    for (const [lane, name] of [
      ['core', 'fireux-core'],
      ['extensions', 'fireux-app'],
      ['extensions', 'fireux-ecosystem'],
      ['ecosystem', 'fireux-fireux'],
    ]) {
      symlinkSync(
        join(repository, 'packages', lane, name),
        join(fixture, 'node_modules', name),
        'dir'
      )
    }
    const output = execFileSync(
      process.execPath,
      ['--conditions=production', '--input-type=module'],
      {
        cwd: fixture,
        env: {
          ...process.env,
          APP_DOMAIN: 'http://localhost:3000',
          NUXT_FIREBASE_APP_ID: 'fixture-app',
        },
        encoding: 'utf8',
        input: `
        import assert from 'node:assert/strict'
        import { defineFireuxApp } from 'fireux-app/config'
        import { defineFireuxEcosystem } from 'fireux-ecosystem/config'
        const input = { id: 'fixture', name: 'Fixture', shortName: 'Fixture', context: 'Local config fixture', ecosystem: 'fireux', ecosystemId: 'fireux', projectId: 'fireux', role: 'tenant', meta: {} }
        const app = defineFireuxApp(input)
        for (const name of ['fireux-blogs', 'fireux-products', 'fireux-ai']) {
          assert.equal(app.modules.filter(entry => entry === name).length, 1)
          assert.ok(app.watch.some(path => path.endsWith('/' + name + '/src/module.ts')))
          assert.ok(app.extends.some(path => path.includes('/' + name + '/src/runtime/')))
        }
        assert.equal(app.extends.some(path => path.includes('/fireux-ecosystem/')), false)
        assert.throws(() => defineFireuxEcosystem(input), /Main Apps require role/)
        const main = defineFireuxEcosystem({ ...input, id: 'fireux-app', role: 'global' })
        assert.equal(main.extends.filter(path => path.includes('/fireux-ecosystem/')).length, 1)
        console.log('Bundle composition passed')
      `,
      }
    )
    assert.match(output, /Bundle composition passed/)
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
