import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue, watch, effectScope } from 'vue'

const source = readFileSync(new URL('../runtime/kitchen/composables/order/funnel/useOrderSession.ts', import.meta.url), 'utf8')
const body = source.slice(source.indexOf('export function useOrderSessionConflict('), source.indexOf('export function useOrderSessionSummaries(')).replace('export ', '')
const tick = () => new Promise(resolve => setTimeout(resolve, 0))

for (const failing of [false, true]) {
  test(failing ? 'failed Menu lookup does not repeatedly retry pagination' : 'session Menu link loads beyond first page and uses slug', async () => {
    let calls = 0
    const directory = { collection: ref([{ id: 'other', slug: 'other' }]), pending: ref(false), loadingMore: ref(false), error: ref(null), hasMore: ref(true), loadMore: async () => {
      calls++
      if (failing) return false
      directory.collection.value.push({ id: 'stable-2', slug: 'drinks' })
      directory.hasMore.value = false
      return true
    } }
    const dependencies = { computed, ref, toValue, watch, text: value => String(value || ''), useMenuDirectory: () => directory, useOrderSessionSummaries: () => ({ sessions: ref([{ firstMenuId: 'stable-2', orderType: 'collection', label: 'Collection', quantity: 1 }]) }), menuContextProfile: () => ({ visibleOrderTypes: ['delivery'], context: 'delivery' }), orderSessionContextForOrderType: type => type, kitchenOrderTypeLabel: type => type, orderSessionMenuPath: ({menuId}) => menuId ? `/drinks/${menuId}` : '' }
    const create = compileFunction(`${stripTypeScriptTypes(body)}; return useOrderSessionConflict`, Object.keys(dependencies))(...Object.values(dependencies))
    const scope = effectScope()
    const state = scope.run(() => create({ enabled: true, kitchenSlug: 'venue', menuId: 'food', menuRouteScope: { kind: 'directory', kitchenSlug: 'venue' }, orderType: 'delivery' }))
    await tick()
    assert.equal(calls, 1)
    assert.equal(state.conflict.value.to, failing ? '' : '/drinks/drinks')
    directory.pending.value = true
    await tick()
    directory.pending.value = false
    await tick()
    assert.equal(calls, 1)
    scope.stop()
  })
}
