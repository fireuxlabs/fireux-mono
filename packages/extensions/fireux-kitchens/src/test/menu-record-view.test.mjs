import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { ref, watch, effectScope } from 'vue'

function load(file, dependencies) {
  const source = stripTypeScriptTypes(
    readFileSync(new URL(file, import.meta.url), 'utf8')
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/export /g, '')
  return compileFunction(
    source + '\nreturn { provideMenuRecordView };',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const { provideMenuRecordView } = load(
  '../runtime/kitchen/composables/workspace/menus/useMenuRecordView.ts',
  { ref, watch, onMounted: (fn) => fn(), provide: () => {}, inject: () => null }
)

test('regular and daily defaults, late loading, refresh and record replacement', () => {
  const owner = effectScope()
  owner.run(() => {
    const scope = ref('user/kitchen/menu')
    const menu = ref(null)
    const state = provideMenuRecordView(scope, menu, () => null)
    menu.value = { id: 'daily', schedule: 'daily' }
    assert.equal(state.view.value, 'content')
    state.select('source')
    menu.value = null
    menu.value = { id: 'daily', schedule: 'daily' }
    assert.equal(
      state.view.value,
      'source',
      'temporary loading must not erase a chosen perspective'
    )
    menu.value = { id: 'regular', schedule: 'regular' }
    assert.equal(state.view.value, 'details')
  })
  owner.stop()
})

test('account, Kitchen and slug changes reset local view even with same record ID', () => {
  const owner = effectScope()
  owner.run(() => {
    const scope = ref('a/k/food')
    const menu = ref({ id: 'food', schedule: 'regular' })
    const state = provideMenuRecordView(scope, menu, () => null)
    for (const next of ['b/k/food', 'b/other/food', 'b/other/drinks']) {
      state.select('publishing')
      scope.value = next
      assert.equal(state.view.value, 'details')
    }
  })
  owner.stop()
})

test('legacy intent overrides default once; a fresh mount returns to default', () => {
  const owner = effectScope()
  owner.run(() => {
    const scope = ref('a/k/food')
    const menu = ref({ id: 'food', schedule: 'daily' })
    let intent = 'source'
    const consume = () => {
      const value = intent
      intent = null
      return value
    }
    const state = provideMenuRecordView(scope, menu, consume)
    assert.equal(state.view.value, 'source')
    const reload = provideMenuRecordView(scope, menu, consume)
    assert.equal(reload.view.value, 'content')
  })
  owner.stop()
})

test('a discarded Nuxt page cannot consume the mounted record handoff', () => {
  const mounts = []
  const { provideMenuRecordView: prepare } = load(
    '../runtime/kitchen/composables/workspace/menus/useMenuRecordView.ts',
    {
      ref,
      watch,
      onMounted: (fn) => mounts.push(fn),
      provide: () => {},
      inject: () => null,
    }
  )
  const scope = ref('a/k/food')
  const menu = ref({ id: 'food', schedule: 'regular' })
  let intent = 'content'
  const consume = () => {
    const next = intent
    intent = null
    return next
  }
  const discarded = effectScope()
  discarded.run(() => prepare(scope, menu, consume))
  discarded.stop()
  assert.equal(intent, 'content')
  const active = effectScope()
  let state
  active.run(() => {
    state = prepare(scope, menu, consume)
  })
  mounts[1]()
  assert.equal(state.view.value, 'content')
  assert.equal(intent, null)
  active.stop()
})
