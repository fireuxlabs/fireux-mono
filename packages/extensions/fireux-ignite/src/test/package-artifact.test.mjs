import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

test('External Node executes packed Ignition exports without a TypeScript loader', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ignite-consumer-'))
  try {
    const root = fileURLToPath(new URL('../../', import.meta.url))
    execFileSync('pnpm', ['pack', '--pack-destination', directory], { cwd: root, stdio: 'pipe' })
    const archive = readdirSync(directory).find(name => name.endsWith('.tgz'))
    assert.ok(archive)
    const consumer = join(directory, 'node_modules/fireux-ignite')
    mkdirSync(consumer, { recursive: true })
    execFileSync('tar', ['-xzf', join(directory, archive), '-C', consumer, '--strip-components=1'])
    const code = `
      import { reconcileIgnition } from 'fireux-ignite';
      import { compareIndustries } from 'fireux-ignite/runtime/utils/compare-industries';
      const brief = { id: 'neutral-proof', requirements: [{id:'r',need:'Need',acceptance:'Observable result'}] };
      const assembly = { id:'empty', elements:[], evidence:[], learnings:[] };
      const result = reconcileIgnition(brief, assembly, assembly);
      if(result.coverage[0].status !== 'uncovered') throw Error('Bad coverage');
      const review = compareIndustries({ baseline:{id:'a',contracts:{}}, candidate:{id:'b',contracts:{}}, deltas:[] });
      if(!review.shared.every(row => row.baseline.level === 'unverified')) throw Error('Invented evidence');
      console.log('external-export-ok');
    `
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: directory, encoding: 'utf8' })
    assert.match(result, /external-export-ok/)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
