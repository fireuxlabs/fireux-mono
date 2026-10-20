import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref, reactive, watch, effectScope, nextTick } from 'vue'

test('a service deep link waits for its mounted section and focuses only the matching service', async () => {
  const raw = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Offerings/Service.vue',
      import.meta.url
    ),
    'utf8'
  )
  const script = raw
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const route = reactive({ hash: '#service-delivery' })
  const calls = []
  const scope = effectScope()
  const section = scope.run(() =>
    compileFunction(`${stripTypeScriptTypes(script)}; return section`, [
      'ref',
      'watch',
      'useRoute',
      'defineProps',
      'provideKitchenServiceEditor',
    ])(
      ref,
      watch,
      () => route,
      () => ({ option: { key: 'collection' } }),
      () => ({ editor: {}, readiness: {}, disabled: false })
    )
  )
  section.value = {
    scrollIntoView: () => calls.push('scroll'),
    focus: () => calls.push('focus'),
  }
  await nextTick()
  assert.deepEqual(calls, [])
  route.hash = '#service-collection'
  await nextTick()
  assert.deepEqual(calls, ['scroll', 'focus'])
  scope.stop()
})
