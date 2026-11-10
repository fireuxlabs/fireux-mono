import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, reactive, watch, effectScope, nextTick } from 'vue'

test('a service deep link waits for its mounted section and focuses only the matching service', async () => {
  const raw = readFileSync(
    new URL(
      '../runtime/kitchen/components/Menu/Services/Service.vue',
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
      'useKitchenServicesContext',
      'computed',
      'offeringsForOption',
    ])(
      ref,
      watch,
      () => route,
      () => ({ option: { key: 'collection' } }),
      () => ({ retained: ref({ offerings: [{ id: 'weekend pickup' }] }) }),
      computed,
      (rows) => rows
    )
  )
  section.value = {
    scrollIntoView: () => calls.push('scroll'),
    focus: () => calls.push('focus'),
    contains: () => true,
    ownerDocument: {
      getElementById: (id) =>
        id === 'service-collection/weekend pickup'
          ? {
              scrollIntoView: () => calls.push('named scroll'),
              focus: () => calls.push('named focus'),
            }
          : null,
    },
  }
  await nextTick()
  assert.deepEqual(calls, [])
  route.hash = '#service-collection'
  await nextTick()
  assert.deepEqual(calls, ['scroll', 'focus'])
  route.hash = '#service-collection/weekend pickup'
  await nextTick()
  assert.deepEqual(calls, ['scroll', 'focus', 'named scroll', 'named focus'])
  scope.stop()
})
