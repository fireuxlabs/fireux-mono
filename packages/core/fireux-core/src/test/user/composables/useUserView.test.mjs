import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  compile,
  computed,
  createSSRApp,
  defineComponent,
  effectScope,
  h,
  reactive,
  ref,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useCollectionSearch } from '../../../runtime/composables/shared/useCollectionSearch.ts'
import { useCardViewToggle } from '../../../runtime/composables/shared/useCardViewToggle.ts'

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
    new URL(
      '../../../runtime/user/composables/useUserView.ts',
      import.meta.url
    ),
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
    new URL(
      '../../../runtime/user/components/Collection/Index.vue',
      import.meta.url
    ),
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

test('the current User switches between Preview and Profile cards with the supplied identity', async (t) => {
  const props = reactive({
    currentUser: {
      id: 'person',
      handle: 'person',
      display_name: 'Direct Name',
      avatar: '',
      bio: 'Direct biography',
    },
  })
  const presentation = view()
  const text = readFileSync(
    new URL(
      '../../../runtime/user/components/Current/Summary.vue',
      import.meta.url
    ),
    'utf8'
  )
  const scope = effectScope()
  t.after(() => scope.stop())
  const state = scope.run(() =>
    load(
      text.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1],
      '{presentation,view,toggleView}',
      {
        defineProps: () => props,
        computed,
        useUserView: () => presentation.format,
        useCardViewToggle,
      }
    )
  )
  const component = defineComponent({
    setup: () => ({ currentUser: props.currentUser, ...state }),
    render: compile(
      text.slice(text.indexOf('<template>') + 10, text.indexOf('</template>'))
    ),
  })
  async function render() {
    const app = createSSRApp(component)
    app.component('UButton', { render: () => null })
    app.component(
      'UserCardsPreview',
      defineComponent({
        props: ['displayName', 'bio'],
        setup: (card) => () =>
          h('div', { 'data-user-card': 'preview' }, [
            card.displayName,
            card.bio,
          ]),
      })
    )
    app.component(
      'UserCardsProfile',
      defineComponent({
        props: ['user'],
        setup: (card) => () => {
          assert.equal(card.user, props.currentUser)
          return h(
            'div',
            { 'data-user-card': 'profile' },
            card.user.display_name
          )
        },
      })
    )
    return renderToString(app)
  }
  const preview = await render()
  assert.match(preview, /data-user-card="preview"/)
  assert.match(preview, /Direct Name/)
  assert.match(preview, /Direct biography/)
  state.toggleView()
  const profile = await render()
  assert.match(profile, /data-user-card="profile"/)
  assert.match(profile, /Direct Name/)
})

test('the User Profile card uses shared presentation and settled Auth without acquiring a session', async () => {
  const props = reactive({
    user: {
      id: 'person',
      handle: 'person',
      display_name: 'Direct Name',
      avatar: 'https://example.test/avatar.png',
      bio: 'Direct biography',
    },
  })
  const auth = {
    uid: ref('person'),
    hasAuthState: ref(true),
    isAuthenticated: ref(true),
  }
  const presentation = view()
  const text = readFileSync(
    new URL(
      '../../../runtime/user/components/Cards/Profile.vue',
      import.meta.url
    ),
    'utf8'
  )
  const script = text.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const state = load(script, '{view,canEdit}', {
    defineProps: () => props,
    computed,
    useAuth: () => auth,
    useUserView: () => presentation.format,
    useUserSession: () =>
      assert.fail('Public presentation must not acquire User or AppUser reads'),
  })
  const component = defineComponent({
    setup: () => ({ user: props.user, ...state }),
    render: compile(
      text.slice(
        text.indexOf('<template>') + 10,
        text.lastIndexOf('</template>')
      )
    ),
  })
  async function render() {
    const app = createSSRApp(component)
    app.component(
      'UAvatar',
      defineComponent({
        props: ['src', 'alt'],
        setup: (p) => () => h('img', { src: p.src, alt: p.alt }),
      })
    )
    app.component(
      'UButton',
      defineComponent({
        props: ['to', 'label'],
        setup:
          (p, { attrs }) =>
          () =>
            h('a', { href: p.to, 'aria-label': attrs['aria-label'] }, p.label),
      })
    )
    return renderToString(app)
  }
  const ready = await render()
  assert.match(ready, /src="proxy:https:\/\/example.test\/avatar.png"/)
  assert.match(ready, /alt="Direct Name"/)
  assert.match(ready, /Direct Name/)
  assert.match(ready, /Direct biography/)
  assert.match(ready, /@person/)
  assert.doesNotMatch(ready, /@@person/)
  assert.match(ready, /aria-label="Edit your profile"/)
  assert.deepEqual(presentation.normalizations, [props.user.avatar])
  assert.deepEqual(presentation.avatars, [props.user.avatar])
  for (const change of ['unresolved', 'anonymous', 'other-account']) {
    auth.hasAuthState.value = change !== 'unresolved'
    auth.isAuthenticated.value = change !== 'anonymous'
    auth.uid.value = change === 'other-account' ? 'other' : 'person'
    assert.equal(state.canEdit.value, false)
    assert.doesNotMatch(
      await render(),
      /Edit your profile|\/dashboard\/user-profile/
    )
  }
})
