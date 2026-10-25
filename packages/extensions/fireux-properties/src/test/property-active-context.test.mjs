import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed, ref } from 'vue'

test('Property active context never exposes a stale or unauthorized selected record', () => {
  const source = readFileSync(
    new URL(
      '../runtime/property/composables/workspace/useActiveProperty.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import .* from .+\n/gm, '')
    .replace(/^export /gm, '')
  const workspace = {
    id: ref('a'),
    data: ref({ id: 'a' }),
    outcome: ref('ready'),
  }
  const access = { ids: ref(['a']), outcome: ref('ready') }
  const active = compileFunction(
    `${stripTypeScriptTypes(source)};return useActiveProperty`,
    ['computed', 'usePropertyWorkspace', 'usePropertyAccess', 'PropertyStorage']
  )(
    computed,
    () => workspace,
    () => access,
    { rootCollection: 'properties' }
  )()
  assert.equal(active.canRead.value, true)
  assert.equal(active.propertyPath.value, 'properties/a')
  for (const outcome of ['pending', 'error', 'empty']) {
    access.outcome.value = outcome
    assert.equal(active.canRead.value, false)
    assert.equal(active.canWrite.value, false)
    assert.equal(active.entity.value, null)
    assert.equal(active.targetOutcome.value, outcome)
  }
  access.outcome.value = 'ready'
  access.ids.value = ['b']
  assert.equal(active.entity.value, null)
  assert.equal(active.targetOutcome.value, 'empty')
  access.ids.value = ['a']
  workspace.data.value = { id: 'old' }
  assert.equal(active.entity.value, null)
  assert.equal(active.targetOutcome.value, 'empty')
  workspace.data.value = { id: 'a' }
  assert.equal(active.canRead.value, true)
  assert.equal(active.targetOutcome.value, 'ready')
})
