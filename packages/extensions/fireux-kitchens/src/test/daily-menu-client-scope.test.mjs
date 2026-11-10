import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, watch } from 'vue'
import { isMenuDate } from '../runtime/menu/utils/calendar/date.ts'
import { commandScopeDeps } from './command-scope-fixture.mjs'

function load(path, result, deps) {
  let source = readFileSync(
    new URL(`../runtime/${path}`, import.meta.url),
    'utf8'
  )
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}

function harness() {
  let resolveToken
  const token = new Promise((resolve) => {
    resolveToken = resolve
  })
  const user = { uid: 'operator', getIdToken: () => token }
  const calls = [],
    currentUser = ref(user),
    date = ref('2026-10-15'),
    life = effectScope()
  const deps = commandScopeDeps({
    computed,
    ref,
    watch,
    isMenuDate,
    useState: () => date,
    useRequestURL: () => new URL('https://misebox.test'),
    menuWebsiteOrigin: (origin) => origin,
    useMenuRecordView: () => ({ select() {} }),
    useKitchenMenuRecordContext: () => ({
      kitchenId: ref('k'),
      menuId: ref('m'),
      timezone: ref('Europe/Zurich'),
      canWrite: ref(true),
      canManage: ref(true),
    }),
    useAuth: () => ({ currentUser }),
    useRequireUser: async () => user,
    $fetch: async (url, options) => {
      calls.push({ url, ...options })
      return { ok: true, kitchenId: 'k', menuId: 'm' }
    },
  })
  deps.useMenuEditorScope = load(
    'menu/composables/useMenuEditorScope.ts',
    'useMenuEditorScope',
    deps
  )
  deps.useMenuMutation = load(
    'menu/composables/firestore/mutations/useMenuMutation.ts',
    'useMenuMutation',
    deps
  )
  const view = life.run(() =>
    load(
      'kitchen/components/FoodAndDrink/Menus/Publication/Daily.vue',
      '({save,error,message})',
      deps
    )
  )
  return { ...view, date, calls, life, resolveToken }
}

test('changing the selected date or disposing its control during credentials prevents publication', async () => {
  for (const change of ['date', 'dispose']) {
    const h = harness()
    const pending = h.save(true)
    await Promise.resolve()
    if (change === 'date') {
      h.date.value = '2026-10-16'
      h.date.value = '2026-10-15'
    } else h.life.stop()
    h.resolveToken('token')
    await pending
    assert.deepEqual(h.calls, [])
    assert.equal(h.error.value, '')
    assert.equal(h.message.value, '')
    h.life.stop()
  }
})

test('daily publication submits and acknowledges the selected date and action', async () => {
  for (const published of [true, false]) {
    const h = harness()
    const pending = h.save(published)
    h.resolveToken('token')
    await pending
    assert.equal(h.calls.length, 1)
    assert.equal(
      h.calls[0].url,
      '/api/workspace/kitchen/menus/daily-publication'
    )
    assert.deepEqual(h.calls[0].body, {
      kitchenId: 'k',
      menuId: 'm',
      date: '2026-10-15',
      published,
    })
    assert.equal(
      h.message.value,
      published ? 'Published 2026-10-15.' : 'Unpublished 2026-10-15.'
    )
    h.life.stop()
  }
})
