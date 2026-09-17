import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, watch } from 'vue'

function load(component, props, names) {
  const source = readFileSync(
    new URL(
      `../runtime/kitchen/components/Workspace/Ordering/${component}.vue`,
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    ['computed', 'ref', 'watch', 'defineProps', 'withDefaults']
  )(
    computed,
    ref,
    watch,
    () => props,
    (values, defaults) => ({ ...defaults, ...values })
  )
}

test('pre-order edits hours while other service editors retain minute conversion', async () => {
  const scope = effectScope()
  try {
    for (const [type, displayed, entered, stored] of [
      ['pre_order', 24, '12', 12],
      ['collection', 1440, '45', 0.75],
      ['delivery', 1440, '30', 0.5],
    ]) {
      const writes = []
      const timing = scope.run(() =>
        load(
          'Timing',
          {
            config: { type, notice_hours: 24 },
            updateFunction: async (patch) => writes.push(patch),
          },
          'noticeValue, updateNotice, validateNotice'
        )
      )
      assert.equal(timing.noticeValue.value, displayed)
      assert.equal(timing.validateNotice(entered).isValid, true)
      assert.equal(timing.validateNotice('-1').isValid, false)
      assert.equal(
        timing.validateNotice(type === 'pre_order' ? '169' : '10081').isValid,
        false
      )
      await timing.updateNotice(entered)
      assert.deepEqual(writes, [{ notice_hours: stored }])
      await timing.updateNotice('0')
      assert.deepEqual(writes[1], { notice_hours: 0 })
    }
  } finally {
    scope.stop()
  }
})

test('service switch and temporary pause remain independent patches', async () => {
  const scope = effectScope()
  try {
    const writes = []
    const control = scope.run(() =>
      load(
        'Availability',
        {
          config: { enabled: false, availability: { paused: true } },
          updateFunction: async (patch) => writes.push(patch),
        },
        'paused, updateEnabled, updatePaused, updatePauseMessage'
      )
    )
    assert.equal(control.paused.value, true)
    await control.updateEnabled(true)
    await control.updatePaused(false)
    await control.updatePauseMessage('Back soon')
    assert.deepEqual(writes, [
      { enabled: true },
      { availability: { paused: false } },
      { availability: { message: 'Back soon' } },
    ])
  } finally {
    scope.stop()
  }
})
