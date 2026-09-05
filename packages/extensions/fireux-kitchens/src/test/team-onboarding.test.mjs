import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL('../runtime/kitchen/utils/team-onboarding.ts', import.meta.url),
  'utf8'
).replace(/^export /gm, '')
const { runTeamOnboarding: run, createTeamOnboardingProgress: progress } =
  compileFunction(
    `${stripTypeScriptTypes(source)}; return { runTeamOnboarding, createTeamOnboardingProgress }`
  )()
const draft = { kitchenId: 'k', name: 'Alex', role: 'operator', invite: true }
function harness() {
  const calls = []
  return {
    calls,
    commands: {
      currentKitchenId: () => 'k',
      create: async (input) => {
        calls.push(['create', input])
        return { memberId: 'm', name: 'Alex' }
      },
      update: async (input) => {
        calls.push(['update', input])
      },
      invite: async (input) => {
        calls.push(['invite', input])
        return { link: 'one-use-link' }
      },
    },
  }
}
test('onboarding uses ordered existing commands and repeats no completed work', async () => {
  const h = harness(),
    p = progress()
  await run(draft, p, h.commands)
  await run(draft, p, h.commands)
  assert.deepEqual(
    h.calls.map((c) => c[0]),
    ['create', 'update', 'invite']
  )
  assert.equal(p.complete, true)
})
test('invitation retry preserves member and responsibility', async () => {
  const h = harness(),
    p = progress()
  const invite = h.commands.invite
  h.commands.invite = async () => {
    throw new Error('Offline')
  }
  await run(draft, p, h.commands)
  assert.equal(p.memberId, 'm')
  assert.equal(p.responsibilitySaved, true)
  h.commands.invite = invite
  await run(draft, p, h.commands)
  assert.deepEqual(
    h.calls.map((c) => c[0]),
    ['create', 'update', 'invite']
  )
})
test('uncertain creation never automatically creates a second member', async () => {
  const h = harness(),
    p = progress()
  let attempts = 0
  h.commands.create = async () => {
    attempts++
    throw new Error('Response lost')
  }
  await run(draft, p, h.commands)
  await run(draft, p, h.commands)
  assert.equal(attempts, 1)
  assert.match(p.error, /Check People/)
})
test('a workspace switch stops remaining steps', async () => {
  const h = harness(),
    p = progress()
  h.commands.create = async () => {
    h.commands.currentKitchenId = () => 'other'
    return { memberId: 'm', name: 'Alex' }
  }
  await run(draft, p, h.commands)
  assert.equal(p.memberId, 'm')
  assert.equal(p.complete, false)
  assert.equal(h.calls.length, 0)
})
test('linked Users skip claim invitation and default members skip role update', async () => {
  const h = harness(),
    p = progress()
  await run({ ...draft, userId: 'u', role: 'member' }, p, h.commands)
  assert.deepEqual(
    h.calls.map((c) => c[0]),
    ['create']
  )
  assert.equal(p.complete, true)
})
test('double confirmation cannot execute concurrent writes', async () => {
  const h = harness(),
    p = progress()
  await Promise.all([run(draft, p, h.commands), run(draft, p, h.commands)])
  assert.deepEqual(
    h.calls.map((c) => c[0]),
    ['create', 'update', 'invite']
  )
})
