import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTick } from 'vue'
import { mountTeamEditor, nodes, textOf } from './fixtures/team-editor.mjs'

test('the regular roster searches role labels and names and selects people without a detail route', async (t) => {
  const f = mountTeamEditor(t, { links: false })
  const rows = () =>
    nodes(f.root).filter(
      (node) =>
        node.tag === 'button' && node.props['aria-pressed'] !== undefined
    )
  assert.deepEqual(rows().map(textOf), ['Alex', 'Morgan'])
  rows()[1].props.onClick()
  assert.deepEqual(f.selections, ['b'])
  const search = nodes(f.root).find(
    (node) =>
      node.tag === 'input' &&
      node.props['aria-label'] === 'Search team members by name or role'
  )
  search.props.onInput('cook')
  await nextTick()
  assert.deepEqual(rows().map(textOf), ['Morgan'])
  search.props.onInput('alex')
  await nextTick()
  assert.deepEqual(rows().map(textOf), ['Alex'])
})

test('Team collection distinguishes empty, loading and failed reads', (t) => {
  for (const [status, expectedState, message] of [
    ['ready', 'empty', 'No team members yet'],
    ['loading', 'loading', ''],
    ['error', 'error', 'Connection failed'],
  ]) {
    const f = mountTeamEditor(t, { status, roster: [] })
    const panel = nodes(f.root).find(
      (node) => node.props?.state === expectedState
    )
    assert.ok(panel, expectedState)
    if (message) assert.equal(textOf(panel), message)
  }
})

test('member detail retains the domain actions for the requested person', (t) => {
  const f = mountTeamEditor(t, { memberId: 'b' })
  assert.match(textOf(f.root), /Morgan/)
  assert.match(textOf(f.root), /Domain action/)
  assert.doesNotMatch(textOf(f.root), /Add person|Alex/)
})
