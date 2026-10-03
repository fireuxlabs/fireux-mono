import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  ref,
  reactive,
  computed,
  watch,
  onScopeDispose,
  effectScope,
} from 'vue'
const repo = new URL('../../../../../', import.meta.url)
function load(path, name, deps) {
  const source = readFileSync(new URL(path, repo), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const core = 'packages/core/fireux-core/src/runtime/'
const useCommandScope = load(
  core + 'composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
for (const [name, path, draftName] of [
  [
    'Core curation',
    core + 'components/Dashboard/Admin/FeaturedSlugs.vue',
    'draft',
  ],
  [
    'FireUX curation',
    'projects/fireux/fireux-app/app/components/Dashboard/Admin/FeaturedSlugsSelection.vue',
    'draftSlugs',
  ],
])
  for (const change of [
    'none',
    'account',
    'app',
    'field',
    'draft',
    'role',
    'membership',
    'disposal',
  ])
    for (const failed of [false, true]) {
      test(`${name} completion ${failed ? 'error' : 'success'} respects ${change}`, async () => {
        const owner = effectScope(),
          reply = deferred(),
          notices = []
        const currentUser = ref({ uid: 'u' }),
          config = reactive({ appId: 'app' }),
          canUpdate = ref(true),
          appUser = ref({ id: 'membership' })
        const props = reactive({
          field: 'featured_kitchens_slugs',
          savedLabel: 'Saved',
          failedLabel: 'Failed',
        })
        const deps = {
          ref,
          reactive,
          computed,
          watch,
          useCommandScope,
          useAuth: () => ({ currentUser }),
          useFireUXConfig: () => config,
          useUserSession: () => ({ appUser }),
          defineProps: () => props,
          withDefaults: (value) => value,
          useToastify: () => ({
            success: (x) => notices.push(x),
            error: (x) => notices.push(x),
          }),
          useAppPublicSettings: () => ({
            settings: ref({}),
            canUpdate,
            outcome: ref('ready'),
            updateFeaturedSlugs: () => reply.promise,
          }),
        }
        const state = owner.run(() =>
          load(path, `({save,saving,${draftName}})`, deps)
        )
        state[draftName].value = draftName === 'draft' ? 'before' : ['before']
        const flight = state.save()
        // Core has no toast but propagates a current failure; obsolete errors must be suppressed.
        const done =
          failed && change === 'none' && draftName === 'draft'
            ? assert.rejects(flight, /Failure/)
            : flight
        if (change === 'account') {
          currentUser.value = { uid: 'other' }
          currentUser.value = { uid: 'u' }
        }
        if (change === 'app') {
          config.appId = 'other'
          config.appId = 'app'
        }
        if (change === 'field') {
          props.field = 'featured_other_slugs'
          props.field = 'featured_kitchens_slugs'
        }
        if (change === 'draft')
          state[draftName].value = draftName === 'draft' ? 'after' : ['after']
        if (change === 'membership') {
          appUser.value = { id: 'other' }
          appUser.value = { id: 'membership' }
        }
        if (change === 'role') {
          canUpdate.value = false
          canUpdate.value = true
        }
        if (change === 'disposal') owner.stop()
        failed ? reply.reject(new Error('Failure')) : reply.resolve()
        await done
        assert.deepEqual(
          notices,
          draftName === 'draftSlugs' && change === 'none'
            ? [failed ? 'Failure' : 'Saved']
            : []
        )
        if (change !== 'disposal') assert.equal(state.saving.value, false)
        owner.stop()
      })
    }
for (const change of ['none', 'account', 'app', 'dialog', 'disposal'])
  for (const failed of [false, true]) {
    test(`notification completion ${failed ? 'error' : 'success'} respects ${change}`, async () => {
      const owner = effectScope(),
        reply = deferred(),
        open = ref(true),
        currentUser = ref({ uid: 'u' }),
        config = reactive({ appId: 'app' })
      const notifications = ref([{ id: 'n', read: false }])
      const state = owner.run(() =>
        load(
          core + 'components/layouts/shared/NotificationsSlideover.vue',
          '({markNotificationRead,mutationError,markingId})',
          {
            ref,
            computed,
            watch,
            useCommandScope,
            defineModel: () => open,
            useRouter: () => ({ resolve: () => ({ matched: [] }) }),
            useWorkspaceNotifications: () => ({ setUnreadCount() {} }),
            useUserNotifications: () => ({
              notifications,
              unreadCount: ref(1),
              pending: ref(false),
              error: ref(null),
            }),
            useUserNotificationMarkRead: () => ({
              markRead: () => reply.promise,
            }),
            useAuth: () => ({ currentUser }),
            useFireUXConfig: () => config,
          }
        )
      )
      const flight = state.markNotificationRead('n')
      if (change === 'account') {
        currentUser.value = { uid: 'other' }
        currentUser.value = { uid: 'u' }
      }
      if (change === 'app') {
        config.appId = 'other'
        config.appId = 'app'
      }
      if (change === 'dialog') {
        open.value = false
        open.value = true
      }
      if (change === 'disposal') owner.stop()
      failed ? reply.reject(new Error('Failure')) : reply.resolve()
      await flight
      assert.equal(
        notifications.value[0].read,
        false,
        'the live reader observes the command; completion does not mutate a different feed'
      )
      assert.equal(
        state.mutationError.value,
        failed && change === 'none' ? 'Notification could not be updated.' : ''
      )
      if (change !== 'disposal') assert.equal(state.markingId.value, '')
      owner.stop()
    })
  }
for (const change of ['none', 'account', 'app', 'record', 'draft', 'disposal'])
  for (const failed of [false, true]) {
    test(`Supplier completion ${failed ? 'error' : 'success'} respects ${change}`, async () => {
      const owner = effectScope(),
        reply = deferred(),
        notices = [],
        currentUser = ref({ uid: 'u' }),
        config = reactive({ appId: 'app' }),
        props = reactive({ supplier: { id: 's' } })
      const state = owner.run(() =>
        load(
          'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Edit/Core.vue',
          '({handleDeliveryAreas})',
          {
            computed,
            defineProps: () => props,
            useToastify: () => ({ add: (x) => notices.push(x) }),
            useSupplierUpdate: (sources) => ({
              captureIntent: useCommandScope([
                () => currentUser.value?.uid,
                () => config.appId,
                ...sources,
              ]),
              updateDeliveryAreas: () => reply.promise,
            }),
          }
        )
      )
      let currentDraft = true
      const flight = state.handleDeliveryAreas(['Before'], () => currentDraft)
      const done =
        failed && change === 'none' ? assert.rejects(flight, /Failure/) : flight
      if (change === 'account') {
        currentUser.value = { uid: 'other' }
        currentUser.value = { uid: 'u' }
      }
      if (change === 'app') {
        config.appId = 'other'
        config.appId = 'app'
      }
      if (change === 'draft') currentDraft = false
      if (change === 'record') {
        props.supplier.id = 'other'
        props.supplier.id = 's'
      }
      if (change === 'disposal') owner.stop()
      failed ? reply.reject(new Error('Failure')) : reply.resolve()
      await done
      assert.equal(notices.length, change === 'none' ? 1 : 0)
      owner.stop()
    })
  }
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const readUserProfileChanges = load(
  core + 'user/utils/profile-validation.ts',
  'readUserProfileChanges',
  {}
)
for (const [body, exists, valid] of [
  [{ display_name: ' New ' }, true, true],
  [{ uid: 'other', bio: '' }, true, false],
  [{ role: 'admin' }, true, false],
  [{ bio: '' }, false, false],
]) {
  test(`User profile workflow retains self-only target and validation ${JSON.stringify(body)}/${exists}`, async () => {
    const writes = [],
      reads = []
    const update = load(
      core + 'user/server/profile/update.ts',
      'updateUserProfile',
      {
        createError,
        readBody: async () => body,
        readUserProfileChanges,
        requireFirebaseBearerUser: async () => ({ uid: 'actor' }),
        FIRESTORE_MUTATION_TARGETS: { users: { database: 'identity' } },
        runGuardedServerTransaction: async (database, callback) => {
          assert.equal(database, 'identity')
          await callback({
            read: async (target, id) => {
              reads.push(id)
              return { exists }
            },
            update: (target, id, patch) => writes.push({ id, patch }),
          })
        },
      }
    )
    if (valid) {
      const result = await update({})
      assert.equal(result.uid, 'actor')
      assert.deepEqual(writes, [
        { id: 'actor', patch: { display_name: 'New' } },
      ])
    } else {
      await assert.rejects(update({}))
      assert.equal(writes.length, 0)
    }
    assert.ok(reads.every((id) => id === 'actor'))
  })
}
test('User notification workflow targets only the verified UID and exact notification', async () => {
  const path = [],
    writes = []
  const mark = load(
    core + 'user/server/notifications/mark-read.ts',
    'markUserNotificationRead',
    {
      getRouterParam: () => 'n',
      setResponseHeaders() {},
      UserNotificationStorage: { collection: 'notifications' },
      requireFirebaseBearerUser: async () => ({ uid: 'actor' }),
      requirePathSegment: (x) => x,
      getRuntimeFirestore: () => ({
        collection: (x) => {
          path.push(x)
          return {
            doc: (x) => {
              path.push(x)
              return {
                collection: (x) => {
                  path.push(x)
                  return {
                    doc: (x) => {
                      path.push(x)
                      return { update: async (patch) => writes.push(patch) }
                    },
                  }
                },
              }
            },
          }
        },
      }),
    }
  )
  assert.deepEqual(await mark({}), {
    ok: true,
    uid: 'actor',
    notificationId: 'n',
    read: true,
  })
  assert.deepEqual(path, ['users', 'actor', 'notifications', 'n'])
  assert.deepEqual(writes, [{ read: true }])
})
