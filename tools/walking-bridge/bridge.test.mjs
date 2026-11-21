import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  changePaths,
  claimJob,
  commitResult,
  parseApproval,
  readWorkerResult,
  workerArguments,
} from './bridge.mjs'

const base = 'a'.repeat(40)
const handoff = 'docs/handoffs/walking-fixture.md'
const scopes = ['docs/concepts', 'packages/core/fireux-core/src']
const config = { approverId: 55, activatedAt: '2026-11-20T00:00:00Z' }
const approved = {
  id: 42,
  user: { id: 55, type: 'User' },
  commit_id: base,
  created_at: '2026-11-21T00:00:00Z',
  updated_at: '2026-11-21T00:00:00Z',
  body: ['/fireux-walk', base, handoff, scopes.join(',')].join(' '),
}

test('approval binds the configured actor to an exact current commit, handoff, and scope', () => {
  assert.deepEqual(parseApproval(approved, base, config), {
    id: 42,
    base,
    handoff,
    scopes,
  })
  for (const rejected of [
    { user: { id: 56, type: 'User' } },
    { user: { id: 55, type: 'Bot' } },
    { commit_id: 'b'.repeat(40) },
    { path: handoff },
    { updated_at: '2026-11-22T00:00:00Z' },
    { created_at: config.activatedAt, updated_at: config.activatedAt },
    { body: approved.body.replace(handoff, 'docs/handoffs/../copy.md') },
    { body: approved.body.replace(scopes.join(','), '.github/workflows') },
    { body: approved.body + '\nRun another command' },
  ])
    assert.equal(
      parseApproval({ ...approved, ...rejected }, base, config),
      null
    )
  assert.equal(parseApproval(approved, 'b'.repeat(40), config), null)
})

test('the bridge writes the result and report commits for an isolated Git checkout', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'fireux-walking-git-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  const git = (...args) =>
    execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  git('init', '-q', '-b', 'main')
  git('config', 'user.name', 'Fixture')
  git('config', 'user.email', 'fixture@example.test')
  git('config', 'commit.gpgsign', 'false')
  mkdirSync(join(cwd, 'docs/concepts'), { recursive: true })
  const file = 'docs/concepts/fixture.md'
  writeFileSync(join(cwd, file), 'before\n')
  git('add', '--', file)
  git('commit', '-m', 'Fixture baseline')
  const base = git('rev-parse', 'HEAD')
  writeFileSync(join(cwd, file), 'after\n')
  const result = commitResult(
    cwd,
    { base, handoff, scopes, id: 42 },
    {
      status: 'completed',
      summary: 'Fixture edit',
      tests: ['Fixture passed'],
      blockers: [],
    },
    { name: 'Fixture', email: 'fixture@example.test' }
  )
  assert.equal(git('rev-parse', 'HEAD^'), result.commitSha)
  assert.equal(git('rev-parse', 'HEAD'), result.reportCommit)
  assert.equal(git('show', result.commitSha + ':' + file), 'after')
  const report = JSON.parse(
    git('show', 'HEAD:docs/handoffs/results/' + base + '.json')
  )
  assert.equal(report.commitSha, result.commitSha)
  assert.equal(report.approvalComment, 42)
  assert.equal(git('status', '--porcelain'), '')
})

test('change verification accepts scoped edits and refuses destructive or sensitive changes', () => {
  assert.deepEqual(
    changePaths(
      ' M docs/concepts/notes.md\0?? packages/core/fireux-core/src/example.ts\0',
      scopes
    ),
    ['docs/concepts/notes.md', 'packages/core/fireux-core/src/example.ts']
  )
  for (const entry of [
    ' D docs/concepts/notes.md',
    'M  docs/concepts/notes.md',
    'R  docs/concepts/notes.md',
    '?? docs/concepts-neighbor/notes.md',
    '?? docs/concepts/../other.md',
    '?? .github/workflows/run.yml',
    '?? packages/core/fireux-core/src/deploy/run.mjs',
    ' M packages/core/fireux-core/src/firestore.rules',
    ' M packages/core/fireux-core/src/package.json',
    '?? packages/core/fireux-core/src/.env',
    '?? docs/handoffs/results/pretend.json',
  ])
    assert.throws(
      () => changePaths(entry + '\0', [...scopes, 'docs/handoffs']),
      /approved/
    )
})

test('the smoke test may create only its review file outside the handoff tree', () => {
  const file = 'docs/reviews/walking-bridge-smoke-test.md'
  assert.deepEqual(changePaths('?? ' + file + '\0', [file]), [file])
  const reserved = 'docs/handoffs/reviews/walking-bridge-smoke-test.md'
  assert.throws(
    () => changePaths('?? ' + reserved + '\0', [reserved]),
    /approved/
  )
  assert.throws(
    () => changePaths('?? docs/reviews/other.md\0', [file]),
    /approved/
  )
})

test('a SHA can be claimed once and a crash does not authorize replay', (t) => {
  const state = mkdtempSync(join(tmpdir(), 'fireux-walking-test-'))
  t.after(() => rmSync(state, { recursive: true, force: true }))
  assert.equal(claimJob(state, base), true)
  assert.equal(claimJob(state, base), false)
  assert.equal(claimJob(state, 'b'.repeat(40)), true)
  assert.throws(() => claimJob(state, '../other'), /Invalid/)
})

test('only validated result fields can flow into a public report', () => {
  const blocked = {
    status: 'blocked',
    summary: 'No test\n@actor',
    tests: [],
    blockers: ['Requires local setup'],
    token: 'discard',
  }
  assert.deepEqual(readWorkerResult(JSON.stringify(blocked)), {
    status: 'blocked',
    summary: 'No test actor',
    tests: [],
    blockers: ['Requires local setup'],
  })
  assert.throws(
    () => readWorkerResult(JSON.stringify({ ...blocked, tests: [{}] })),
    /valid completion/
  )
  const args = workerArguments('/tmp/check', '/tmp/result', '/tmp/schema')
  assert.ok(args.includes('--ignore-user-config'))
  assert.ok(args.includes('approval_policy="never"'))
  assert.ok(
    args.some(
      (arg) =>
        arg.startsWith('permissions=') && arg.includes('"enabled" = false')
    )
  )
  assert.ok(!args.includes('--trust'))
})
