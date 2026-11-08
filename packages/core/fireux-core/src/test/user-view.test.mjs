import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, reactive } from 'vue'
import { useCollectionSearch } from '../runtime/composables/shared/useCollectionSearch.ts'

function load(source, name, dependencies) {
  const script = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(script) + '; return ' + name,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function view() {
  const avatars = [],
    normalizations = []
  const source = readFileSync(
    new URL('../runtime/user/composables/useUserView.ts', import.meta.url),
    'utf8'
  )
  const useUserView = load(source, 'useUserView', {
    resolveUserAvatarSource: (value) => {
      normalizations.push(value)
      return value || '/img/ecosystem/avatar.png'
    },
    useAvatarProxy: () => ({
      getProxiedAvatarUrl: (value) => {
        avatars.push(value)
        return `proxy:${value}`
      },
    }),
  })
  return { format: useUserView(), avatars, normalizations }
}

test('User View exposes one formatter and requires an explicit nonblank identity', () => {
  const { format, avatars, normalizations } = view()
  assert.deepEqual(Object.keys(format), ['toView'])
  for (const target of [undefined, null, { id: '' }, { id: '  ' }])
    assert.equal(format.toView(target), null)
  assert.deepEqual(avatars, [])
  assert.deepEqual(normalizations, [])
  assert.deepEqual(format.toView({ id: 'person', handle: '', avatar: '' }), {
    handleLabel: '',
    avatarUrl: 'proxy:/img/ecosystem/avatar.png',
    to: '',
  })
})

test('User View derives only handle label, avatar and destination without reading name or bio', () => {
  const { format, avatars, normalizations } = view()
  const user = {
    id: ' person ',
    handle: 'daniel-watson',
    avatar: 'https://example.test/avatar.png',
    get display_name() {
      assert.fail('User View read the direct display name')
    },
    get bio() {
      assert.fail('User View read the direct biography')
    },
  }
  assert.deepEqual(format.toView(user), {
    handleLabel: '@daniel-watson',
    avatarUrl: 'proxy:https://example.test/avatar.png',
    to: '/users/daniel-watson',
  })
  assert.deepEqual(normalizations, ['https://example.test/avatar.png'])
  assert.deepEqual(avatars, ['https://example.test/avatar.png'])
})

test('User collection still searches direct name, handle and bio with the three-field View', () => {
  const props = reactive({
    users: [
      {
        id: 'one',
        display_name: 'Alex Unique',
        handle: 'first-handle',
        bio: 'Repairs bicycles',
        avatar: '',
      },
      {
        id: 'two',
        display_name: 'Blair Example',
        handle: 'second-handle',
        bio: 'Bakes bread',
        avatar: '',
      },
    ],
  })
  const { format } = view()
  const source = readFileSync(
    new URL('../runtime/user/components/Collection/Index.vue', import.meta.url),
    'utf8'
  ).match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const state = load(source, '{query,visibleItems}', {
    defineProps: () => props,
    computed,
    useUserView: () => format,
    useCollectionSearch,
  })
  for (const text of ['Alex Unique', 'first-handle', 'Repairs bicycles']) {
    state.query.value = text
    assert.deepEqual(
      state.visibleItems.value.map((user) => user.id),
      ['one']
    )
    assert.equal(state.visibleItems.value[0], props.users[0])
  }
  state.query.value = 'Bakes bread'
  assert.deepEqual(
    state.visibleItems.value.map((user) => user.id),
    ['two']
  )
  state.query.value = 'does not exist'
  assert.deepEqual(state.visibleItems.value, [])
  state.query.value = ''
  assert.deepEqual(state.visibleItems.value, props.users)
})
