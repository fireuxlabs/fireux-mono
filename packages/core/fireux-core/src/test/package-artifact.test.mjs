import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

// Exercise the delivered artifact, not the source tree or monorepo aliases.
test('Core tarball supplies production exports and their relative dependencies', () => {
  const directory = mkdtempSync(join(tmpdir(), 'fireux-package-'))
  const root = fileURLToPath(new URL('../../', import.meta.url))
  try {
    execFileSync('pnpm', ['pack', '--pack-destination', directory], { cwd: root, stdio: 'pipe' })
    const archive = readdirSync(directory).find(name => name.endsWith('.tgz'))
    assert.ok(archive)
    execFileSync('tar', ['-xzf', join(directory, archive), '-C', directory])
    const packed = join(directory, 'package')
    const manifest = JSON.parse(readFileSync(join(packed, 'package.json'), 'utf8'))
    assert.equal(manifest.dependencies['nuxt-vuefire'], '^1.1.0')
    assert.deepEqual(
      Object.keys(manifest.dependencies).filter((name) => name.startsWith('fireux-')),
      []
    )
    assert.equal(existsSync(join(packed, 'src/config/app/fireux.config.ts')), false)
    assert.equal(existsSync(join(packed, 'dist/config/app/fireux.config.mjs')), false)
    assert.ok(existsSync(join(packed, 'src/types/runtime-config.d.ts')))
    for (const name of ['app', 'module']) {
      const production = manifest.exports[`./config/${name}/*`].production
      const folder = resolve(packed, dirname(production))
      const files = readdirSync(folder).filter(name => name.endsWith('.mjs'))
      assert.ok(files.length)
      const visited = new Set()
      function verify(file) {
        if (visited.has(file)) return
        visited.add(file)
        assert.ok(existsSync(file), `Missing packed dependency: ${file}`)
        const source = readFileSync(file, 'utf8')
        for (const match of source.matchAll(/(?:from\s+|import\s*\()['"](\.{1,2}\/[^'"]+)['"]/g)) {
          verify(resolve(dirname(file), match[1]))
        }
        if (file === join(packed, 'dist/config/app/firebase.mjs')) {
          const plugins = [...source.matchAll(/resolver\.resolve\(\s*['"](\.{1,2}\/[^'"]+)['"]/g)]
          assert.equal(plugins.length, 2)
          for (const match of plugins) {
            const plugin = resolve(dirname(file), match[1])
            assert.ok(existsSync(plugin), `Missing packed runtime: ${plugin}`)
          }
        }
      }
      for (const file of files) verify(join(folder, file))
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
