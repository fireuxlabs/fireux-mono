import assert from 'node:assert/strict'
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
  chmod,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { ensureCodexTask } from './codex-task.mjs'

async function fixture(t, mode = 'normal') {
  const root = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'fireux-codex-task-'))
  )
  t.after(() => rm(root, { recursive: true, force: true }))
  const ownerPath = 'projects/example/example-app'
  await mkdir(path.join(root, ownerPath), { recursive: true })
  const task = {
    key: 'example-app:creation',
    title: 'example-app — continue development',
    prompt:
      'Read the App and its owning context. Prepare the handoff; no edits.',
    ownerPath,
  }
  const statePath = path.join(root, 'fake-state.json')
  await writeFile(
    statePath,
    JSON.stringify({ mode, calls: [], starts: 0, turns: 0, failures: 0 })
  )
  const executable = path.join(root, 'fake-codex.mjs')
  await writeFile(
    executable,
    `#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
const file = ${JSON.stringify(statePath)}
const state = JSON.parse(readFileSync(file, 'utf8'))
const save = () => writeFileSync(file, JSON.stringify(state))
state.args = process.argv.slice(2)
state.apiKeysPresent = ['OPENAI_API_KEY', 'FIREUX_AI_API_KEY'].filter((key) => key in process.env)
save()
if (state.mode === 'unavailable') {
  console.error('No local Codex control socket')
  process.exit(1)
}
const lines = createInterface({ input: process.stdin })
let loaded = false
lines.on('line', (line) => {
  const request = JSON.parse(line)
  state.calls.push(request)
  save()
  if (!request.id) return
  const reply = (result) => process.stdout.write(JSON.stringify({ id: request.id, result }) + '\\n')
  const reject = () => {
    state.failures++
    save()
    process.stdout.write(JSON.stringify({ id: request.id, error: { code: -32602, message: 'Controlled rejection' } }) + '\\n')
  }
  if (request.method === 'initialize') {
    if (state.mode === 'timeout') return
    if (state.mode === 'slow') return setTimeout(() => reply({}), 180)
    return reply({})
  }
  if (request.method === 'thread/start') {
    state.starts++
    save()
    if (state.mode === 'drop-start') process.exit(1)
    loaded = true
    return reply({ thread: { id: 'thread-fixture-1' } })
  }
  if (request.method === 'thread/resume') {
    loaded = true
    return reply({ thread: { id: 'thread-fixture-1' } })
  }
  if (request.method === 'thread/name/set') {
    if (state.mode === 'reject-name-once' && !state.failures) return reject()
    return reply({})
  }
  if (request.method === 'turn/start') {
    if (!loaded) return reject()
    if (state.mode === 'reject-turn-once' && !state.failures) return reject()
    state.turns++
    save()
    if (state.mode === 'drop-turn') process.exit(1)
    return reply({ turn: { id: 'turn-fixture-1' } })
  }
  return reject()
})
`
  )
  await chmod(executable, 0o755)
  const state = async () => JSON.parse(await readFile(statePath, 'utf8'))
  const receipts = async () => {
    const directory = path.join(root, '.cache/ignition-codex')
    let names
    try {
      names = await readdir(directory)
    } catch (error) {
      if (error.code === 'ENOENT') return []
      throw error
    }
    return Promise.all(
      names
        .filter((name) => name.endsWith('.json'))
        .map(async (name) => ({
          file: path.join(directory, name),
          value: JSON.parse(await readFile(path.join(directory, name), 'utf8')),
        }))
    )
  }
  return {
    root,
    task,
    executable,
    state,
    receipts,
    run: (extra = {}) =>
      ensureCodexTask({ root, task, executable, timeoutMs: 2500, ...extra }),
  }
}

test('creates one named persistent local task and retry is a no-op', async (t) => {
  const original = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FIREUX_AI_API_KEY: process.env.FIREUX_AI_API_KEY,
  }
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
  process.env.OPENAI_API_KEY = 'test-legacy-key'
  process.env.FIREUX_AI_API_KEY = 'test-app-key'
  const f = await fixture(t)
  const result = await f.run({ socket: '/tmp/explicit-control.sock' })
  assert.equal(result.status, 'created')
  assert.equal(result.threadId, 'thread-fixture-1')
  assert.equal(result.url, 'codex://threads/thread-fixture-1')
  const state = await f.state()
  assert.deepEqual(state.apiKeysPresent, [])
  assert.equal(process.env.OPENAI_API_KEY, 'test-legacy-key')
  assert.equal(process.env.FIREUX_AI_API_KEY, 'test-app-key')
  assert.deepEqual(state.args, [
    'app-server',
    'proxy',
    '--sock',
    '/tmp/explicit-control.sock',
  ])
  assert.deepEqual(
    state.calls.map((call) => call.method),
    [
      'initialize',
      'initialized',
      'thread/start',
      'thread/name/set',
      'turn/start',
    ]
  )
  assert.deepEqual(
    state.calls.find((call) => call.method === 'thread/start').params,
    { cwd: f.root, ephemeral: false }
  )
  assert.deepEqual(
    state.calls.find((call) => call.method === 'thread/name/set').params,
    { threadId: result.threadId, name: f.task.title }
  )
  assert.deepEqual(
    state.calls.find((call) => call.method === 'turn/start').params,
    {
      threadId: result.threadId,
      input: [{ type: 'text', text: f.task.prompt }],
    }
  )
  const retry = await f.run({ executable: path.join(f.root, 'missing-cli') })
  assert.equal(retry.status, 'existing')
  assert.equal(retry.threadId, result.threadId)
  assert.deepEqual(await f.state(), state)
  assert.equal((await f.receipts())[0].value.state, 'complete')
  assert.deepEqual(
    (await readdir(path.dirname(result.receiptPath))).filter(
      (name) => name.endsWith('.lock') || name.endsWith('.tmp')
    ),
    []
  )
})

test('a naming rejection resumes the persisted thread on a new daemon connection before handoff', async (t) => {
  const f = await fixture(t, 'reject-name-once')
  await assert.rejects(f.run(), /thread\/name\/set rejected/)
  assert.equal((await f.receipts())[0].value.threadId, 'thread-fixture-1')
  assert.equal((await f.receipts())[0].value.state, 'started')
  assert.equal((await f.run()).status, 'existing')
  const state = await f.state()
  assert.equal(state.starts, 1)
  assert.equal(state.turns, 1)
  const resumed = state.calls.find((call) => call.method === 'thread/resume')
  assert.deepEqual(resumed.params, {
    threadId: 'thread-fixture-1',
    excludeTurns: true,
  })
  assert.deepEqual(
    state.calls.slice(-5).map((call) => call.method),
    [
      'initialize',
      'initialized',
      'thread/resume',
      'thread/name/set',
      'turn/start',
    ]
  )
  assert.equal(
    state.calls.filter((call) => call.method === 'thread/name/set').length,
    2
  )
})

test('a rejected handoff can be retried without a duplicate thread or naming request', async (t) => {
  const f = await fixture(t, 'reject-turn-once')
  await assert.rejects(f.run(), /turn\/start rejected/)
  assert.equal((await f.receipts())[0].value.state, 'named')
  await f.run()
  const state = await f.state()
  assert.equal(state.starts, 1)
  assert.equal(state.turns, 1)
  assert.equal(
    state.calls.filter((call) => call.method === 'thread/resume').length,
    1
  )
  assert.equal(
    state.calls.filter((call) => call.method === 'thread/name/set').length,
    1
  )
})

test('unknown thread creation is retained for reconciliation and never blindly retried', async (t) => {
  const f = await fixture(t, 'drop-start')
  await assert.rejects(f.run(), /Thread creation outcome is unknown/)
  assert.equal((await f.receipts())[0].value.state, 'uncertain-start')
  const state = await f.state()
  await assert.rejects(
    f.run(),
    /Reconcile.*no duplicate was created by this retry/
  )
  assert.deepEqual(await f.state(), state)
  assert.equal(state.starts, 1)
})

test('unknown handoff delivery never sends the prompt twice', async (t) => {
  const f = await fixture(t, 'drop-turn')
  await assert.rejects(f.run(), /Handoff outcome is unknown/)
  assert.equal((await f.receipts())[0].value.state, 'uncertain-turn')
  const state = await f.state()
  await assert.rejects(f.run(), /no duplicate handoff was sent by this retry/)
  assert.deepEqual(await f.state(), state)
  assert.equal(state.starts, 1)
  assert.equal(state.turns, 1)
})

test('identity conflicts do not contact Codex or alter the original receipt', async (t) => {
  const f = await fixture(t)
  await f.run()
  const before = await f.state()
  const receipt = await readFile((await f.receipts())[0].file, 'utf8')
  await assert.rejects(
    f.run({ task: { ...f.task, prompt: 'Different handoff' } }),
    /receipt conflicts/
  )
  assert.deepEqual(await f.state(), before)
  assert.equal(await readFile((await f.receipts())[0].file, 'utf8'), receipt)
})

test('invalid or escaping owner paths fail before spawning or creating receipts', async (t) => {
  const f = await fixture(t)
  const outside = await mkdtemp(path.join(os.tmpdir(), 'fireux-outside-'))
  t.after(() => rm(outside, { recursive: true, force: true }))
  await symlink(outside, path.join(f.root, 'external'))
  for (const ownerPath of [
    '../outside',
    '/tmp',
    '.',
    'external',
    'projects\\example',
    'missing',
  ]) {
    await assert.rejects(f.run({ task: { ...f.task, ownerPath } }))
  }
  assert.deepEqual((await f.state()).calls, [])
  assert.deepEqual(await f.receipts(), [])
})

test('a held creation lock prevents competing proxy and duplicate task creation', async (t) => {
  const f = await fixture(t, 'slow')
  const running = f.run()
  const directory = path.join(f.root, '.cache/ignition-codex')
  const deadline = Date.now() + 1000
  let locked = false
  while (Date.now() < deadline) {
    try {
      locked = (await readdir(directory)).some((name) => name.endsWith('.lock'))
    } catch {}
    if (locked) break
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  assert.ok(locked)
  await assert.rejects(f.run(), /already locked/)
  await running
  assert.equal((await f.state()).starts, 1)
})

test('missing CLI or control socket fails without creating a thread and releases its lock', async (t) => {
  const f = await fixture(t, 'unavailable')
  await assert.rejects(
    f.run({ executable: path.join(f.root, 'missing-cli') }),
    /proxy unavailable/
  )
  await assert.rejects(f.run(), /No local Codex control socket/)
  assert.equal((await f.state()).starts, 0)
  assert.deepEqual(await f.receipts(), [])
  assert.deepEqual(
    await readdir(path.join(f.root, '.cache/ignition-codex')),
    []
  )
})

test('an unresponsive proxy is bounded by timeout without task mutation', async (t) => {
  const f = await fixture(t, 'timeout')
  const began = Date.now()
  await assert.rejects(f.run({ timeoutMs: 500 }), /initialize timed out/)
  assert.ok(Date.now() - began < 2000)
  assert.equal((await f.state()).starts, 0)
  assert.deepEqual(await f.receipts(), [])
})
