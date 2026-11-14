import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { advanceIgnitionBuild } from '../../../server/utils/ignition-build.ts'
import {
  deliverIgnition,
  parseWorkerOptions,
} from '../../../ignition/delivery.mjs'

const input = {
  id: 'shared-proof',
  name: 'Shared proof',
  outcome: 'Operate a reviewed shared project.',
}
function queue() {
  const rows = new Map([
    [
      'web-request',
      {
        kind: 'ignition',
        ignition: { stage: 'accepted' },
        guest_contact: { company: input.name },
      },
    ],
  ])
  let tail = Promise.resolve()
  const run = (body, uid = 'admin') => {
    const result = tail.then(async () => {
      const changes = []
      const value = await advanceIgnitionBuild(
        {
          read: async (id) => structuredClone(rows.get(id)),
          create: (id, row) =>
            changes.push(() => {
              assert.ok(!rows.has(id))
              rows.set(id, row)
            }),
          update: (id, patch) =>
            changes.push(() => {
              const row = rows.get(id)
              for (const [key, value] of Object.entries(patch)) {
                const parts = key.split('.')
                let target = row
                for (const part of parts.slice(0, -1))
                  target = target[part] ??= {}
                target[parts.at(-1)] = value
              }
            }),
        },
        body,
        { appId: 'host-app', uid, at: 'now' }
      )
      changes.forEach((commit) => commit())
      return value
    })
    tail = result.catch(() => {})
    return result
  }
  return { rows, run }
}

test('web acceptance and Codex enqueue converge on one immutable build in the same Conversation queue', async () => {
  const q = queue()
  const jobs = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      q.run({
        action: 'enqueue',
        input,
        ...(i % 2 ? { requestId: 'web-request' } : {}),
      })
    )
  )
  assert.equal(new Set(jobs.map((j) => j.id)).size, 1)
  assert.equal(q.rows.size, 2)
  assert.deepEqual(q.rows.get(jobs[0].id).guest_contact, {
    company: input.name,
  })
  assert.equal(q.rows.get('web-request').ignition.forwarded_to, jobs[0].id)
  await assert.rejects(
    q.run({
      action: 'enqueue',
      input: { ...input, outcome: 'Replace the approved purpose' },
    }),
    /different build/
  )
  q.rows.set('unaccepted', { kind: 'ignition', ignition: { stage: 'new' } })
  await assert.rejects(
    q.run({ action: 'enqueue', input, requestId: 'unaccepted' }),
    /Accept/
  )
})

test('persistent worker claims reject competing workers and immutable linked task cannot be replaced', async () => {
  const q = queue(),
    job = await q.run({ action: 'enqueue', input })
  const token = 'a'.repeat(40),
    other = 'b'.repeat(40)
  await q.run({ action: 'claim', id: job.id, token })
  await assert.rejects(
    q.run({ action: 'claim', id: job.id, token: other }),
    /Another worker/
  )
  await assert.rejects(
    q.run({
      action: 'report',
      id: job.id,
      token: other,
      state: 'ready',
      threadId: 'task-a',
    }),
    /Another worker/
  )
  await q.run({ action: 'report', id: job.id, token, state: 'task-pending' })
  const done = await q.run({
    action: 'report',
    id: job.id,
    token,
    state: 'ready',
    threadId: 'task-a',
  })
  assert.equal(done.task.id, 'task-a')
  assert.equal(
    (await q.run({ action: 'claim', id: job.id, token: other })).task.id,
    'task-a'
  )
  await assert.rejects(
    q.run({
      action: 'report',
      id: job.id,
      token,
      state: 'ready',
      threadId: 'task-b',
    }),
    /cannot be replaced/
  )
  await assert.rejects(
    q.run({ action: 'report', id: job.id, token, state: 'task-pending' }),
    /cannot be replaced/
  )
})

test('local worker retries connection failure and lost completion response without another task', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ignition-worker-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const tokenFile = join(root, 'token')
  await writeFile(tokenFile, 'test-admin-token')
  const q = queue()
  let taskCount = 0,
    available = false,
    loseReply = false
  const fetcher = async (url, options) => {
    assert.equal(options.redirect, 'error')
    assert.equal(options.headers.authorization, 'Bearer test-admin-token')
    const body = JSON.parse(options.body)
    const build = await q.run(body)
    if (body.action === 'report' && body.state === 'ready' && loseReply) {
      loseReply = false
      throw Error('Lost response')
    }
    return { ok: true, json: async () => ({ ok: true, build }) }
  }
  const create = async () =>
    available
      ? {
          codexTaskResult: {
            status: 'created',
            threadId: `task-${++taskCount}`,
          },
        }
      : { codexTaskResult: { status: 'pending' } }
  const options = {
    root,
    queueUrl: 'http://localhost:3000',
    tokenFile,
    fetcher,
    create,
    input,
  }
  assert.equal((await deliverIgnition(options)).state, 'task-pending')
  available = true
  loseReply = true
  await assert.rejects(deliverIgnition(options), /Lost response/)
  assert.equal((await deliverIgnition(options)).task.id, 'task-1')
  assert.equal(taskCount, 1)
  const second = await mkdtemp(join(tmpdir(), 'ignition-worker-other-'))
  t.after(() => rm(second, { recursive: true, force: true }))
  assert.equal(
    (await deliverIgnition({ ...options, root: second })).task.id,
    'task-1'
  )
  assert.equal(taskCount, 1)
})

test('unsafe origins, redirects, missing credentials and unsupported fields fail closed', async () => {
  assert.throws(
    () => parseWorkerOptions([]),
    /requires the existing delivery queue/
  )
  await assert.rejects(
    deliverIgnition({
      queueUrl: 'http://external.example',
      root: tmpdir(),
      tokenFile: 'no',
    }),
    /HTTPS/
  )
  const q = queue()
  await assert.rejects(
    q.run({ action: 'enqueue', input, execute: 'arbitrary' }),
    /Invalid build command/
  )
  await assert.rejects(
    q.run({ action: 'enqueue', input: { ...input, id: '../escape' } })
  )
})

test('lost report before server commit replays the saved task link without re-running source creation', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ignition-report-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const tokenFile = join(root, 'token')
  await writeFile(tokenFile, 'test-token')
  const q = queue()
  let fail = true,
    creates = 0
  const fetcher = async (_, options) => {
    const body = JSON.parse(options.body)
    if (body.action === 'report' && fail) {
      fail = false
      throw Error('Connection lost before commit')
    }
    return {
      ok: true,
      json: async () => ({ ok: true, build: await q.run(body) }),
    }
  }
  const options = {
    root,
    queueUrl: 'http://localhost:3000',
    tokenFile,
    fetcher,
    input,
    create: async () => {
      creates++
      return { codexTaskResult: { status: 'created', threadId: 'one-task' } }
    },
  }
  await assert.rejects(deliverIgnition(options), /before commit/)
  const resumed = await deliverIgnition(options)
  assert.equal(resumed.task.id, 'one-task')
  assert.equal(creates, 1)
  assert.ok(!JSON.stringify(resumed).includes('claim_hash'))
})

test('queue build Vue surfaces compile with native component slots and bound state', async () => {
  const { readFile } = await import('node:fs/promises')
  const { parse, compileTemplate } = await import('vue/compiler-sfc')
  for (const name of ['Build', 'Queue']) {
    const source = await readFile(
      new URL(`../../components/Ignition/${name}.vue`, import.meta.url),
      'utf8'
    )
    const { descriptor, errors } = parse(source)
    assert.deepEqual(errors, [])
    const result = compileTemplate({
      source: descriptor.template.content,
      filename: `${name}.vue`,
      id: `ignition-${name}`,
    })
    assert.deepEqual(result.errors, [])
  }
})

test('build endpoint authorises the current App before body access or transaction work', async () => {
  const { readFile } = await import('node:fs/promises')
  const { stripTypeScriptTypes } = await import('node:module')
  const { compileFunction } = await import('node:vm')
  const text = await readFile(
    new URL(
      '../../../server/api/internal/control/ignition-requests/build.post.ts',
      import.meta.url
    ),
    'utf8'
  )
  const source = stripTypeScriptTypes(
    text.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  ).replace('export default', 'return')
  let authorised = false,
    bodies = 0,
    transactions = 0
  const handler = compileFunction(source, [
    'Timestamp',
    'defineEventHandler',
    'readBody',
    'setResponseHeader',
    'runGuardedServerTransaction',
    'serverAppConversationsTarget',
    'requireFireuxAppAdmin',
    'advanceIgnitionBuild',
  ])(
    { now: () => 'now' },
    (fn) => fn,
    async () => {
      bodies++
      return { action: 'enqueue', input }
    },
    () => {},
    async (_placement, work) => {
      transactions++
      return work({
        read: async () => ({ exists: false, data: undefined }),
        create: (target, _id, row) => {
          assert.equal(target, 'trusted-app')
          assert.equal(row.app_id, 'trusted-app')
        },
        update: () => {},
      })
    },
    (appId) => appId,
    async () => {
      if (!authorised) throw Error('Admin access required')
      return { appId: 'trusted-app', uid: 'verified-admin' }
    },
    advanceIgnitionBuild
  )
  await assert.rejects(handler({}), /Admin access/)
  assert.equal(bodies, 0)
  assert.equal(transactions, 0)
  authorised = true
  const result = await handler({})
  assert.equal(result.build.id, 'ignition-build-shared-proof')
  assert.equal(transactions, 1)
})
