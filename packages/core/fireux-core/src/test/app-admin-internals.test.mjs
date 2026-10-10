import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, reactive, ref, watch } from 'vue'
import { useCommandScope } from '../runtime/composables/fireux/commands/useCommandScope.ts'

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function fixture() {
  const props = reactive({ app: { id: 'app-a' } })
  const session = {
    uid: ref('actor-a'),
    appUser: ref({ role: 'admin' }),
    pending: ref(false),
    error: ref(null),
  }
  const notices = [],
    commands = []
  const source = readFileSync(
    new URL('../runtime/app/components/Edit/Admin.vue', import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const deps = {
    computed,
    ref,
    watch,
    useCommandScope,
    defineProps: () => props,
    useToastify: () => ({
      success: (value) => notices.push(value),
      error: (value) => notices.push(value),
    }),
    useAppSession: () => session,
    runAppUserCommand: (input) => {
      const result = deferred()
      commands.push({ input, result })
      return result.promise
    },
    useAppUsers: () => ({
      memberships: ref([]),
      administrators: ref([]),
      joinRequests: ref([]),
      userById: () => null,
    }),
    useUserView: () => ({ pill: () => null }),
    useAppJoinRequests: ({ handleJoinRequests }) => ({
      items: ref([]),
      approve: (uid) => handleJoinRequests(uid, true),
      reject: (uid) => handleJoinRequests(uid, false),
    }),
  }
  const owner = effectScope()
  const api = owner.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return { removeAdmin, setMemberSubscription, onApprove, adminActionUid, subscriptionActionUid }`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  return { owner, api, notices, commands, session, props }
}
function invalidate(h, changed) {
  if (changed === 'account') {
    h.session.uid.value = 'other'
    h.session.uid.value = 'actor-a'
  } else if (changed === 'app') {
    h.props.app.id = 'other'
    h.props.app.id = 'app-a'
  } else if (changed === 'membership') {
    const membership = h.session.appUser.value
    h.session.appUser.value = null
    h.session.appUser.value = membership
  } else if (changed === 'failure') {
    h.session.error.value = new Error('Read failed')
    h.session.error.value = null
  } else h.owner.stop()
}

for (const changed of ['account', 'app', 'membership', 'failure', 'disposed']) {
  for (const completion of ['success', 'error']) {
    test(`App administration suppresses ${completion} feedback after ${changed} scope changes`, async () => {
      const h = fixture()
      const flight = h.api.onApprove('person')
      const result =
        completion === 'error'
          ? assert.rejects(flight, /Command failed/)
          : flight
      invalidate(h, changed)
      if (completion === 'success')
        h.commands[0].result.resolve({ committed: true })
      else h.commands[0].result.reject(new Error('Command failed'))
      await result
      assert.deepEqual(h.notices, [])
      assert.deepEqual(h.commands[0].input, {
        action: 'review-join',
        userId: 'person',
        approve: true,
      })
      h.owner.stop()
    })
  }
}

for (const action of ['admin', 'subscription']) {
  test(`Old ${action} completion cannot clear a newer pending App operation`, async () => {
    const h = fixture()
    const run = (uid) =>
      action === 'admin'
        ? h.api.removeAdmin(uid)
        : h.api.setMemberSubscription({ uid, subscription: 'premium' })
    const pending =
      action === 'admin' ? h.api.adminActionUid : h.api.subscriptionActionUid
    const first = run('first')
    invalidate(h, 'account')
    assert.equal(pending.value, null)
    const second = run('second')
    assert.equal(pending.value, 'second')
    h.commands[0].result.resolve({ committed: true })
    await first
    assert.equal(pending.value, 'second')
    assert.deepEqual(h.notices, [])
    h.commands[1].result.resolve({ committed: true })
    await second
    assert.equal(pending.value, null)
    assert.equal(h.notices.length, 1)
    h.owner.stop()
  })
}

test('Current App administration still reports command errors and permits a retry', async () => {
  const h = fixture()
  const flight = h.api.removeAdmin('person')
  const failed = assert.rejects(flight, /Command failed/)
  h.commands[0].result.reject(new Error('Command failed'))
  await failed
  assert.equal(h.api.adminActionUid.value, null)
  assert.deepEqual(h.notices, ['Failed to remove admin: Command failed'])
  const retry = h.api.removeAdmin('person')
  h.commands[1].result.resolve({ committed: true })
  await retry
  assert.equal(h.notices.at(-1), 'Removed admin')
  h.owner.stop()
})
