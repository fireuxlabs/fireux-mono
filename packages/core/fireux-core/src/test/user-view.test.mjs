import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL('../runtime/user/composables/useUserView.ts', import.meta.url),
  'utf8'
).replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')

function view() {
  const avatars = []
  const useUserView = compileFunction(
    `${stripTypeScriptTypes(source).replace(/^export /gm, '')}; return useUserView`,
    [
      'safeString',
      'resolveUserAvatarSource',
      'useAvatarProxy',
      'normalizeUserHandle',
    ]
  )(
    (value) => String(value ?? ''),
    (value) => value || '/user-avatar.svg',
    () => ({
      getProxiedAvatarUrl: (value) => {
        avatars.push(value)
        return `proxy:${value}`
      },
    }),
    (value) => value.trim().replace(/^@/, '').toLowerCase()
  )
  return { format: useUserView(), avatars }
}

test('User presentation requires an explicit identity and does not fabricate a name', () => {
  const { format, avatars } = view()
  assert.equal(format.profile(), null)
  assert.equal(format.interface({ id: '', display_name: 'No id' }), null)
  assert.deepEqual(avatars, [])
  const card = format.pill({
    id: 'person',
    display_name: '',
    handle: '',
    avatar: '',
    bio: '',
  })
  assert.equal(card.displayName, '')
  assert.equal(card.to, '')
})

test('User presentation carries canonical identity fields and computes the avatar once', () => {
  const { format, avatars } = view()
  const card = format.interface({
    id: ' person ',
    display_name: ' Daniel ',
    handle: 'daniel',
    avatar: 'avatar.png',
    bio: ' Builds things ',
  })
  assert.deepEqual(card, {
    id: 'person',
    to: '/users/daniel',
    imageUrl: 'proxy:avatar.png',
    avatarUrl: 'proxy:avatar.png',
    displayName: 'Daniel',
    subtitle: '@daniel',
    summary: 'Builds things',
    handle: '@daniel',
    bio: 'Builds things',
  })
  assert.deepEqual(avatars, ['avatar.png'])
})
