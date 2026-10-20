import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref } from 'vue'

function harness() {
  let resolveToken
  const token = new Promise((resolve) => {
    resolveToken = resolve
  })
  const user = { uid: 'operator', getIdToken: () => token }
  const calls = [],
    currentUser = ref(user),
    selectedId = ref('k')
  let current = true
  const deps = {
    useRoute: () => ({ fullPath: '/workspace/kitchen/food-and-drink/menus/specials' }),
    useAuth: () => ({ currentUser }),
    useRequireUser: async () => user,
    useWorkspaceWriteGuard: () => ({ requireWritableData: () => {} }),
    useKitchenWorkspaceSelection: () => ({ selectedId }),
    useMenuEditorScope: () => () => () => true,
    $fetch: async (url, options) => {
      calls.push({ url, ...options })
      return { ok: true, kitchenId: 'k', menuId: 'm' }
    },
  }
  const source = readFileSync(
    new URL(
      '../runtime/menu/composables/firestore/mutations/useMenuMutation.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  const { mutate } = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuMutation()`,
    Object.keys(deps)
  )(...Object.values(deps))
  return {
    mutate,
    calls,
    resolveToken,
    current: () => current,
    invalidate: () => {
      current = false
    },
  }
}

test('changing the selected date or disposing its control during credentials prevents dispatch', async () => {
  const h = harness()
  const pending = h.mutate(
    'daily-publication',
    'POST',
    { kitchenId: 'k', menuId: 'm', date: '2026-10-15', published: true },
    h.current
  )
  await Promise.resolve()
  h.invalidate()
  h.resolveToken('token')
  await assert.rejects(pending, /changed/)
  assert.equal(h.calls.length, 0)
})

test('daily publication captures one detached date/action before credentials', async () => {
  const h = harness()
  const body = {
    kitchenId: 'k',
    menuId: 'm',
    date: '2026-10-15',
    published: true,
  }
  const pending = h.mutate('daily-publication', 'POST', body, h.current)
  body.date = '2026-10-16'
  body.published = false
  h.resolveToken('token')
  await pending
  assert.equal(h.calls[0].body.date, '2026-10-15')
  assert.equal(h.calls[0].body.published, true)
})
