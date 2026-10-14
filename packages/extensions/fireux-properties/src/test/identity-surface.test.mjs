import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  ref,
  watch,
  effectScope,
  compile,
  createSSRApp,
  h,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
const root = new URL('../runtime/', import.meta.url)
const clean = (s) =>
  s
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
function load(file, result, deps) {
  const s = readFileSync(new URL(file, root), 'utf8')
  const script = s.includes('<script setup')
    ? s.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
    : s
  return compileFunction(
    `${stripTypeScriptTypes(clean(script))};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useIdentity = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/useIdentity.ts',
  'useIdentity',
  { computed }
)
test('shared Identity never offers editing for an unsettled or failed read', () => {
  const status = ref('pending'),
    canWrite = ref(true),
    id = ref('a'),
    fields = ref({ name: 'Saved' })
  const state = useIdentity({ status, canWrite, id, fields })
  for (const [input, display] of [
    ['pending', 'loading'],
    ['idle', 'empty'],
    ['empty', 'empty'],
    ['missing', 'missing'],
    ['error', 'error'],
  ]) {
    status.value = input
    assert.equal(state.readState.value, display)
    assert.equal(state.canWrite.value, false)
    assert.deepEqual(state.availableActions.value, [])
  }
  status.value = 'ready'
  assert.equal(state.readState.value, null)
  assert.deepEqual(state.availableActions.value, ['read', 'update'])
  canWrite.value = false
  assert.deepEqual(state.availableActions.value, ['read'])
})
for (const [family, file] of [
  ['Portfolio', 'portfolio/components/Workspace/Identity/Read.vue'],
  ['Property', 'property/components/Workspace/Identity/Index.vue'],
]) {
  for (const [status, state] of [
    ['pending', 'loading'],
    ['missing', 'missing'],
    ['error', 'error'],
    ['idle', 'empty'],
  ]) {
    test(`${family} displays ${state} without displaying saved profile data`, async () => {
      const source = readFileSync(new URL(file, root), 'utf8'),
        template = source.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
      const model = useIdentity({
        id: ref('a'),
        fields: ref({}),
        status: ref(status),
        canWrite: ref(false),
      })
      const app = createSSRApp({
        setup: () => ({
          identity: model,
          ...model,
          name: ref('OBSOLETE PROFILE'),
          selectedProperty: ref({ identity: { name: 'OBSOLETE PROFILE' } }),
        }),
        render: compile(template),
      })
      app.config.warnHandler = () => {}
      app.component('MoleculesStateCard', {
        props: ['state'],
        setup: (p) => () => h('div', { 'data-state': p.state }, p.state),
      })
      app.component('DiagnosticsDebugPanel', { render: () => null })
      const html = await renderToString(app)
      assert.match(html, new RegExp(`data-state="${state}"`))
      assert.doesNotMatch(html, /OBSOLETE PROFILE/)
    })
  }
}
test('Portfolio focused editor closes on account, selection and authority changes', () => {
  const currentUser = ref({ uid: 'alice' }),
    portfolioId = ref('a'),
    canWrite = ref(true),
    scope = effectScope()
  const state = scope.run(() =>
    load('portfolio/components/Workspace/Identity/Index.vue', '({open})', {
      ref,
      watch,
      useAuth: () => ({ currentUser }),
      usePortfolioIdentity: () => ({ portfolioId, canWrite }),
    })
  )
  state.open.value = true
  currentUser.value = { uid: 'bob' }
  assert.equal(state.open.value, false)
  state.open.value = true
  portfolioId.value = 'b'
  assert.equal(state.open.value, false)
  state.open.value = true
  canWrite.value = false
  assert.equal(state.open.value, false)
  scope.stop()
})

test('Property focused editor closes on account, selection and authority changes', () => {
  const currentUser = ref({ uid: 'alice' }),
    propertyId = ref('a'),
    canWrite = ref(true),
    scope = effectScope()
  const state = scope.run(() =>
    load('property/components/Workspace/Identity/Index.vue', '({open})', {
      ref,
      watch,
      useAuth: () => ({ currentUser }),
      usePropertyIdentity: () => ({ propertyId, canWrite }),
    })
  )
  for (const change of [
    () => (currentUser.value = { uid: 'bob' }),
    () => (propertyId.value = 'b'),
    () => (canWrite.value = false),
  ]) {
    state.open.value = true
    change()
    assert.equal(state.open.value, false)
  }
  scope.stop()
})

for (const family of ['Property', 'Portfolio']) {
  test(`${family} Home distinguishes failed/loading reads and keeps archived identity management local`, async () => {
    const path = `${family.toLowerCase()}/components/Workspace/Home/Single.vue`
    const source = readFileSync(new URL(path, root), 'utf8')
    for (const outcome of ['pending', 'error', 'empty', 'ready']) {
      const props = {
        outcome,
        entity: {
          id: 'archived',
          identity: { name: 'SAVED IDENTITY', status: 'archived' },
        },
      }
      const model = load(path, '({ card })', {
        computed,
        defineProps: () => props,
        [`use${family}Interface`]: () => ({
          pill: (entity) => ({
            id: entity.id,
            title: entity.identity.name,
            to: '/missing-public-detail',
          }),
        }),
      })
      const app = createSSRApp({
        setup: () => ({ ...props, ...model }),
        render: compile(
          source.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
        ),
      })
      app.config.warnHandler = () => {}
      app.component('MoleculesStateCard', {
        props: ['loading', 'state'],
        setup: (p) => () =>
          h('div', { 'data-state': p.loading ? 'loading' : p.state }),
      })
      app.component('WorkspaceTargetCard', {
        props: ['card'],
        setup: (p) => () => h('a', { href: p.card.to }, p.card.title),
      })
      app.component('UButton', {
        props: ['to', 'label'],
        setup: (p) => () => h('a', { href: p.to }, p.label),
      })
      const html = await renderToString(app)
      if (outcome === 'ready') {
        assert.match(
          html,
          new RegExp(`href="/workspace/${family.toLowerCase()}/identity"`)
        )
        assert.match(html, /SAVED IDENTITY/)
        assert.doesNotMatch(html, /missing-public-detail/)
      } else {
        assert.doesNotMatch(html, /SAVED IDENTITY/)
        if (outcome !== 'empty') {
          assert.match(
            html,
            new RegExp(
              `data-state="${outcome === 'pending' ? 'loading' : 'error'}"`
            )
          )
          assert.doesNotMatch(html, /Choose a/)
        } else assert.match(html, /Choose a/)
      }
    }
  })
  test(`${family} Overview links only the selected identity and keeps other summaries informational`, () => {
    const state = load(
      `${family.toLowerCase()}/components/Workspace/Overview/Index.vue`,
      '({focusCard,multipleCards})',
      {
        computed,
        [`use${family}Overview`]: () => ({
          focus: ref({ entity: { id: 'selected' } }),
          multiple: ref({ items: [{ id: 'selected' }, { id: 'other' }] }),
        }),
        [`use${family}Interface`]: () => ({
          pill: (entity) => ({
            id: entity.id,
            title: entity.id,
            to: '/public-missing',
          }),
        }),
      }
    )
    assert.equal(
      state.focusCard.value.to,
      `/workspace/${family.toLowerCase()}/identity`
    )
    assert.deepEqual(
      state.multipleCards.value.map((card) => card.to),
      ['', '']
    )
  })
}
