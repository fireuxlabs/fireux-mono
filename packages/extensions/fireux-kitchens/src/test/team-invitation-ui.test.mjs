import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, watch } from 'vue'
import { parse } from 'vue/compiler-sfc'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { authRedirectPath } from '../../../../core/fireux-core/src/runtime/user/utils/auth-redirect.ts'

function setup(path, bindings, result) {
  const file = readFileSync(new URL(path, import.meta.url), 'utf8')
  const script = parse(file).descriptor.scriptSetup.content.replace(
    /^import[\s\S]*?from ['"][^'"]+['"]\n/gm,
    ''
  )
  const dependencies = { ref, computed, watch, useCommandScope, ...bindings }
  const scope = effectScope()
  const run = compileFunction(
    `return (async () => { ${stripTypeScriptTypes(script)}; return {${result}} })()`,
    Object.keys(dependencies)
  )
  return scope
    .run(() => run(...Object.values(dependencies)))
    .then((state) => ({ state, dispose: () => scope.stop() }))
}

const pagePath = '../runtime/pages/kitchen/member-invitation/[token].vue'
const buttonPath = '../runtime/kitchen/components/Team/Invitation.vue'

test('sign-in returns to the invitation and acceptance opens the explicit onboarding flow for the issuing Kitchen', async () => {
  const token = ref('invitation-token')
  const currentUser = ref({ uid: 'recipient', getIdToken: async () => 'auth' })
  const calls = []
  const { state, dispose } = await setup(
    pagePath,
    {
      definePageMeta() {},
      useRouteParam: () => token,
      useRequestURL: () => new URL('https://app.example'),
      useWorkspaceEntryCta: () => ({
        workspaceEntryHref: ref('https://work.example/'),
      }),
      useAuth: () => ({ currentUser, authState: ref('AUTHENTICATED') }),
      authRedirectPath,
      useFetch: async () => ({
        data: ref(null),
        error: ref(null),
        pending: ref(false),
      }),
      $fetch: async (path, options) => {
        calls.push({ path, options })
        return {
          ok: true,
          kitchenId: 'venue 2',
          memberId: 'person',
          memberName: 'Alex',
        }
      },
    },
    'acceptInvitation, accepted, authTo, continueTo'
  )
  try {
    assert.equal(
      new URL(state.authTo.value, 'https://app.example').searchParams.get(
        'redirect'
      ),
      '/kitchen/member-invitation/invitation-token'
    )
    await state.acceptInvitation()
    assert.equal(calls.length, 1)
    assert.equal(
      calls[0].path,
      '/api/kitchen/member-invitations/invitation-token'
    )
    assert.equal(calls[0].options.headers.Authorization, 'Bearer auth')
    assert.equal(state.accepted.value.memberName, 'Alex')
    const next = new URL(state.continueTo.value)
    assert.equal(next.origin, 'https://work.example')
    assert.equal(next.pathname, '/workspace/kitchen/create')
    assert.equal(next.searchParams.get('existingRootId'), 'venue 2')
    token.value = 'different-invitation'
    assert.equal(state.accepted.value, null)
  } finally {
    dispose()
  }
})

test('clipboard failure preserves the issued link for manual copy and changing accounts clears it', async () => {
  const currentUser = ref({ uid: 'operator' })
  const toasts = []
  let issued = 0
  const { state, dispose } = await setup(
    buttonPath,
    {
      defineProps: () => ({
        memberId: 'person',
        createInvitation: async (memberId) => {
          assert.equal(memberId, 'person')
          issued++
          return {
            link: 'https://app.example/kitchen/member-invitation/example',
          }
        },
      }),
      useAuth: () => ({ currentUser }),
      useToast: () => ({ add: (toast) => toasts.push(toast) }),
      navigator: {
        clipboard: {
          writeText: async () => {
            throw Error('Clipboard unavailable')
          },
        },
      },
    },
    'copyInvitation, manualLink'
  )
  try {
    await state.copyInvitation()
    assert.equal(issued, 1)
    assert.equal(
      state.manualLink.value,
      'https://app.example/kitchen/member-invitation/example'
    )
    assert.deepEqual(toasts, [])
    currentUser.value = { uid: 'someone-else' }
    assert.equal(state.manualLink.value, '')
  } finally {
    dispose()
  }
})
