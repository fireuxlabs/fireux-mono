import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTick } from 'vue'
import {
  mountTeamEditor,
  nodes,
  textOf,
  button,
} from './fixtures/team-editor.mjs'

test('Read reviews the accessible roster even without a selected member and has no write controls', async (t) => {
  const f = mountTeamEditor(t)
  f.selected.value = ''
  await nextTick()
  await f.prepare('read')
  const review = f.dialog()
  assert.ok(review, 'Read opens a review')
  assert.match(textOf(review), /Alex/)
  assert.match(textOf(review), /Morgan/)
  assert.doesNotMatch(textOf(review), /Add person|Remove member|Save changes/)
  const links = nodes(review).filter((node) => node.tag === 'a')
  assert.deepEqual(
    links.map((row) => [textOf(row), row.props.href]),
    [
      ['Alex', '/workspace/project/team/a'],
      ['Morgan', '/workspace/project/team/b'],
    ]
  )
  links[1].props.onClick()
  await nextTick()
  assert.deepEqual(f.selections, ['b'])
  assert.equal(f.dialog(), undefined)
  assert.deepEqual(f.calls, [])
})

test('changing Workspace dismisses roster review and unavailable actions cannot reopen a dialog', async (t) => {
  const f = mountTeamEditor(t)
  await f.prepare('read')
  assert.ok(f.dialog())
  f.workspaceId.value = 'next'
  await nextTick()
  assert.equal(f.dialog(), undefined)
  f.actions.value = []
  for (const action of ['read', 'delete', 'create', 'update']) {
    await f.prepare(action)
    assert.equal(f.dialog(), undefined, action)
  }
  assert.deepEqual(f.calls, [])
})

for (const action of ['create', 'update']) {
  test(
    action + ' opens the existing form with the suggested name',
    async (t) => {
      const f = mountTeamEditor(t)
      await f.prepare(action, 'New name')
      assert.ok(
        nodes(f.dialog()).some(
          (node) => node.tag === 'input' && node.props.value === 'New name'
        )
      )
      assert.deepEqual(f.calls, [])
    }
  )
}

test('Delete names the selected person and only an explicit confirmation calls the removal command', async (t) => {
  const f = mountTeamEditor(t)
  await f.prepare('delete', 'Morgan')
  const review = f.dialog()
  assert.ok(review, 'Delete opens a confirmation')
  assert.match(textOf(review), /Alex/)
  assert.deepEqual(f.calls, [])
  button(review, 'Cancel')()
  await nextTick()
  assert.equal(f.dialog(), undefined)
  assert.deepEqual(f.calls, [])
  await f.prepare('delete')
  const confirm = button(f.dialog(), 'Remove member')
  const flight = confirm()
  confirm()
  assert.deepEqual(
    f.calls.map((call) => call.id),
    ['a']
  )
  assert.equal(f.calls[0].isCurrent(), true)
  f.calls[0].resolve({ name: 'Alex' })
  await flight
  await nextTick()
  assert.equal(f.dialog(), undefined)
})

for (const change of ['selection', 'workspace', 'permission']) {
  test('prepared removal expires after a ' + change + ' change', async (t) => {
    const f = mountTeamEditor(t)
    await f.prepare('delete')
    assert.ok(f.dialog())
    const confirm = button(f.dialog(), 'Remove member')
    if (change === 'selection') f.selected.value = 'b'
    if (change === 'workspace') f.workspaceId.value = 'second'
    if (change === 'permission') f.actions.value = ['read']
    await nextTick()
    assert.equal(f.dialog(), undefined)
    confirm()
    assert.deepEqual(f.calls, [])
  })
}

test('revoking permission during removal invalidates dispatch and preserves a later review', async (t) => {
  const f = mountTeamEditor(t)
  await f.prepare('delete')
  const old = button(f.dialog(), 'Remove member')()
  f.actions.value = ['read']
  await nextTick()
  assert.equal(f.calls[0].isCurrent(), false)
  assert.equal(f.dialog(), undefined)
  f.actions.value = ['read', 'delete']
  await f.prepare('delete')
  const retry = button(f.dialog(), 'Remove member')()
  f.calls[0].reject(new Error('Obsolete failure'))
  await old
  assert.equal(f.calls[1].isCurrent(), true)
  assert.doesNotMatch(textOf(f.dialog()), /Obsolete failure/)
  f.calls[1].resolve({ name: 'Alex' })
  await retry
})

test('a confirmed removal that fails stays available for explicit retry', async (t) => {
  const f = mountTeamEditor(t)
  await f.prepare('delete')
  const first = button(f.dialog(), 'Remove member')()
  f.calls[0].reject(new Error('Removal failed'))
  await first
  await nextTick()
  assert.match(textOf(f.dialog()), /Removal failed/)
  button(f.dialog(), 'Remove member')()
  assert.deepEqual(
    f.calls.map((call) => call.id),
    ['a', 'a']
  )
  f.calls[1].resolve({ name: 'Alex' })
  await nextTick()
})
test('manual Remove on a member detail route reviews that route member before writing', async (t) => {
  const f = mountTeamEditor(t, { memberId: 'b' })
  button(f.root, 'Remove member')()
  await nextTick()
  const review = f.dialog()
  assert.ok(review)
  assert.match(textOf(review), /Morgan/)
  assert.deepEqual(f.calls, [])
  button(review, 'Remove member')()
  assert.deepEqual(
    f.calls.map((call) => call.id),
    ['b']
  )
  f.calls[0].resolve({ name: 'Morgan' })
  await nextTick()
})
