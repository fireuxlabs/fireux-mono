import assert from 'node:assert/strict'
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { openArguments } from './workspace.mjs'

test('editor navigation binds files and line numbers to the selected checkout', (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'fireux-workspace-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  writeFileSync(path.join(root, 'fireux-mono.code-workspace'), '{}')
  writeFileSync(path.join(root, 'a file.vue'), '')
  const args = openArguments(root, ['a file.vue:42:3'])
  assert.equal(args[0], '--reuse-window')
  assert.ok(args[1].endsWith('/fireux-mono.code-workspace'))
  assert.equal(args[2], '--goto')
  assert.ok(args[3].endsWith('/a file.vue:42:3'))
  assert.equal(openArguments(root).length, 2)
})

test('navigation rejects another checkout, including symlink escapes', (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'fireux-workspace-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const directory of ['main', 'worktree']) {
    mkdirSync(path.join(root, directory))
    writeFileSync(path.join(root, directory, 'file.vue'), '')
    writeFileSync(
      path.join(root, directory, 'fireux-mono.code-workspace'),
      '{}'
    )
  }
  symlinkSync(path.join(root, 'worktree'), path.join(root, 'main/other'))
  for (const file of ['../worktree/file.vue', 'other/file.vue']) {
    assert.throws(
      () => openArguments(path.join(root, 'main'), [file]),
      /another checkout/
    )
  }
})
