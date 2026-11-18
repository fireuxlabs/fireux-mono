import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { computed, effectScope, ref, watch } from 'vue'

const source = readFileSync(
  new URL(
    '../runtime/kitchen/composables/workspace/prep/usePrepProduction.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import .*\n/gm, '')
  .replace(/^export /gm, '')
const load = new Function(
  'computed',
  'ref',
  'watch',
  'onMounted',
  'useKitchenWorkspace',
  'useAppSession',
  'useFireUXConfig',
  'localStorage',
  stripTypeScriptTypes(source) + '; return usePrepProduction()'
)

test('a recorded batch survives route remount without duplication and stays scoped', () => {
  const id = ref('la-tap'),
    uid = ref('operator'),
    outcome = ref('ready')
  const saved = new Map()
  const scope = effectScope()
  function mount() {
    let finishMount
    const result = scope.run(() =>
      load(
        computed,
        ref,
        watch,
        (callback) => {
          finishMount = callback
        },
        () => ({ id, outcome }),
        () => ({ uid }),
        () => ({ appId: 'misebox' }),
        {
          getItem: (key) => saved.get(key),
          setItem: (key, value) => saved.set(key, value),
        }
      )
    )
    finishMount()
    return result
  }
  try {
    const plan = mount()
    assert.equal(plan.add('Octopus', '2026-11-23', 8, 'portions'), true)
    const task = plan.tasks.value[0]
    assert.equal(plan.complete(task.id, 0), false)
    assert.equal(plan.complete(task.id, 7), true)
    plan.complete(task.id, 9)
    assert.equal(mount().tasks.value[0].batch.quantity, 7)
    id.value = 'other'
    assert.deepEqual(plan.tasks.value, [])
    id.value = 'la-tap'
    assert.equal(plan.tasks.value.length, 1)
    uid.value = 'other-operator'
    assert.deepEqual(plan.tasks.value, [])
  } finally {
    scope.stop()
  }
})
