import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { assetAppDirectories, runAssetCheck } from './assets.mjs'
import { writeAppAssetFixture } from '../../packages/core/fireux-core/src/test/fixtures/app-assets.mjs'

test('asset discovery includes the starter and Apps without development ports', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'fireux-asset-cli-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const directories = ['projects/templates/starter', 'projects/example/no-port']
  for (const path of directories) {
    await mkdir(join(root, path), { recursive: true })
    await writeFile(join(root, path, 'package.json'), '{}')
    await writeFile(join(root, path, 'nuxt.config.ts'), 'export default {}')
    await writeAppAssetFixture(join(root, path, 'public'))
  }
  assert.deepEqual(
    assetAppDirectories(root),
    directories.map((path) => join(root, path)).sort()
  )
  const output = []
  assert.equal(await runAssetCheck([], root, (line) => output.push(line)), 0)
  assert.match(output.at(-1), /16\/16.*2 Apps/)
  await rm(join(root, directories[0], 'public/img/app/logo.png'))
  assert.equal(await runAssetCheck([], root, (line) => output.push(line)), 1)
  assert.ok(output.some((line) => /starter.*logo.png: Missing file/.test(line)))
  await assert.rejects(runAssetCheck(['outside'], root), /Choose a Nuxt App/)
})
