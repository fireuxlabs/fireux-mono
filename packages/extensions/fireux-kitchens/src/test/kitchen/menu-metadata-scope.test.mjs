import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  getCurrentInstance,
  reactive,
  ref,
  toRef,
  toValue,
  watch,
} from 'vue'
import { commandScopeDeps } from '../command-scope-fixture.mjs'

function load(path, deps, name) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const bindings = commandScopeDeps(deps)
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

function fixture() {
  const lifetime = effectScope()
  const auth = deferred(),
    token = deferred(),
    response = deferred()
  const calls = [],
    notices = [],
    destinations = []
  const user = { uid: 'u', getIdToken: () => token.promise }
  const currentUser = ref(user)
  const appUser = ref({
    role: 'user',
    subscription: 'pro',
    created: { at: 'one' },
  })
  const config = reactive({ appId: 'app' })
  const kitchenId = ref('k'),
    menuSlug = ref('food')
  const route = ref({
    fullPath: '/workspace/kitchen/food-and-drink/menus/food',
  })
  const menu = ref({
    id: 'm',
    name: 'Food',
    slug: 'food',
    status: 'draft',
    description: 'Original',
  })
  const menuOutcome = computed(() => (menu.value ? 'ready' : 'empty'))
  const grants = ref(['k'])
  const source = Object.assign(ref(null), {
    pending: ref(false),
    error: ref(null),
  })
  const deps = {
    computed,
    ref,
    watch,
    toValue,
    getCurrentInstance,
    useAuth: () => ({ currentUser }),
    useRequireUser: () => auth.promise,
    useAppSession: () => ({
      uid: computed(() => currentUser.value?.uid || ''),
      appUser,
      pending: ref(false),
      error: ref(null),
    }),
    useUserSession: () => ({ appUser }),
    useFireUXConfig: () => config,
    useWorkspace: () => ({ selectedId: kitchenId }),
    useRouteParam: () => menuSlug,
    useRouter: () => ({
      currentRoute: route,
      replace: (path) => destinations.push(path),
    }),
    useToastify: () => ({ add: (notice) => notices.push(notice) }),
    useKitchenAccess: () => ({
      ids: grants,
      pending: ref(false),
      error: ref(null),
    }),
    useKitchenRead: () => ({
      kitchen: ref({}),
      place: ref(null),
      outcome: ref('ready'),
      error: ref(null),
    }),
    useKitchenInterface: () => ({ surface: () => ({}) }),
    readRuntimeFirestoreDatabaseId: () => 'db',
    useKitchenMenuRead: () => ({
      menu,
      outcome: menuOutcome,
      error: ref(null),
    }),
    useFirestoreRead: () => ({ firestoreFetchDoc: () => source }),
    MenuSourceUploadStorage: { collection: 'menu-uploads' },
    useKitchenOfferingCollection: () => ({
      offerings: ref([]),
      outcome: ref('empty'),
      error: ref(null),
    }),
    useMenuSectionCollection: () => ({
      sections: ref([]),
      pending: ref(false),
      error: ref(null),
      collectionPath: ref(''),
    }),
    useMenuSectionMutations: () => ({}),
    useMenuPublication: () => ({}),
    $fetch: (url, options) => {
      calls.push({ url, options })
      return response.promise
    },
  }
  deps.useMenuEditorScope = load(
    '../../runtime/menu/composables/useMenuEditorScope.ts',
    deps,
    'useMenuEditorScope'
  )
  for (const name of ['useMenuMutation', 'useMenuUpdate', 'useMenuDelete'])
    deps[name] = load(
      `../../runtime/menu/composables/firestore/mutations/${name}.ts`,
      deps,
      name
    )
  const record = lifetime.run(
    load(
      '../../runtime/kitchen/composables/workspace/menus/useKitchenMenuRecordContext.ts',
      deps,
      'createKitchenMenuRecordContext'
    )
  )
  const field = (method) =>
    lifetime.run(() => {
      const metadata = load(
        '../../runtime/kitchen/composables/workspace/menus/useMenuRecordMetadata.ts',
        deps,
        'useMenuRecordMetadata'
      )(record)
      const useEditableStringField = load(
        '../../../../../core/fireux-core/src/runtime/composables/forms/useEditableStringField.ts',
        deps,
        'useEditableStringField'
      )
      return useEditableStringField({
        value: '',
        captureIntent: metadata.captureIntent,
        update: metadata[method],
      })
    })
  function change(kind) {
    const targets = {
      account: [currentUser, { uid: 'other' }],
      logout: [currentUser, null],
      app: [toRef(config, 'appId'), 'other'],
      membership: [appUser, { ...appUser.value, created: { at: 'two' } }],
      kitchen: [kitchenId, 'other'],
      slug: [menuSlug, 'other'],
      route: [route, { fullPath: '/other' }],
      grant: [grants, []],
      record: [menu, null],
    }
    if (kind === 'dispose') return lifetime.stop()
    if (kind === 'stable') return
    const [target, temporary] = targets[kind]
    const original = target.value
    target.value = temporary
    target.value = original
  }
  const receipt = {
    ok: true,
    kitchenId: 'k',
    menuId: 'm',
    id: 'm',
    slug: 'food',
  }
  return {
    lifetime,
    auth,
    token,
    response,
    receipt,
    user,
    calls,
    notices,
    destinations,
    menu,
    record,
    field,
    change,
  }
}

test('routed Menu update, rename and delete reject obsolete destination or authority before dispatch', async () => {
  for (const action of ['update', 'rename', 'delete'])
    for (const stage of ['auth', 'token', 'response'])
      for (const change of [
        'stable',
        'account',
        'logout',
        'app',
        'membership',
        'kitchen',
        'slug',
        'route',
        'grant',
        'record',
        'dispose',
      ]) {
        const f = fixture()
        const changes = {
          description: 'Original',
          doc: { url: 'u', name: 'n', type: 't', storage_path: 'p' },
        }
        const input =
          action === 'update'
            ? { changes: structuredClone(changes) }
            : action === 'rename'
              ? { name: 'Dinner' }
              : {}
        const result =
          action === 'update'
            ? f.record.updateMenu('k', 'm', changes)
            : action === 'rename'
              ? f.record.renameMenu('k', 'm', 'Dinner')
              : f.record.deleteMenu('k', 'm')
        const shouldDispatch = change === 'stable' || stage === 'response'
        const done = shouldDispatch
          ? result
          : assert.rejects(result, /changed/, `${action}/${stage}/${change}`)
        if (stage !== 'auth') {
          f.auth.resolve(f.user)
          await Promise.resolve()
        }
        if (stage === 'response') {
          f.token.resolve('token')
          await Promise.resolve()
          assert.equal(f.calls.length, 1)
        }
        changes.doc.url = 'changed'
        f.change(change)
        f.auth.resolve(f.user)
        f.token.resolve('token')
        f.response.resolve(f.receipt)
        await done
        assert.equal(f.calls.length, shouldDispatch ? 1 : 0)
        if (shouldDispatch)
          assert.deepEqual(f.calls[0].options.body, {
            kitchenId: 'k',
            menuId: 'm',
            ...input,
          })
        f.lifetime.stop()
      }
})

test('the shared field cancels stale Menu metadata submissions and reports a current command failure', async () => {
  for (const method of [
    'rename',
    'updateInternalName',
    'updateDescription',
    'updateOrder',
  ])
    for (const scenario of [
      'saved',
      'changed-draft',
      'changed-after-dispatch',
      'failed',
    ]) {
      const f = fixture(),
        field = f.field(method)
      const draft = method === 'updateOrder' ? '2' : 'Dinner'
      field.startEditing()
      field.draft.value = draft
      const result = field.save()
      f.auth.resolve(f.user)
      await Promise.resolve()
      if (scenario === 'changed-draft') {
        field.draft.value = 'another'
        field.draft.value = draft
      }
      f.token.resolve('token')
      await Promise.resolve()
      if (scenario === 'changed-after-dispatch') {
        field.draft.value = 'another'
        field.draft.value = draft
      }
      if (scenario === 'failed') f.response.reject(new Error('Failure'))
      else f.response.resolve(f.receipt)
      await result
      assert.equal(f.calls.length, scenario === 'changed-draft' ? 0 : 1, method)
      assert.equal(
        field.errorMessage.value,
        scenario === 'failed' ? 'Failure' : ''
      )
      assert.equal(field.isEditing.value, scenario !== 'saved')
      assert.equal(
        f.notices.length,
        method === 'rename' && scenario === 'saved' ? 1 : 0
      )
      assert.equal(f.destinations.length, f.notices.length)
      f.lifetime.stop()
    }
})

test('Surviving Record context completes own live rename/delete but rejects external routed intent', async () => {
  for (const action of ['rename', 'delete'])
    for (const change of [
      'stable',
      'slug',
      'route',
      'account',
      'kitchen',
      'grant',
      'dispose',
    ]) {
      const f = fixture()
      const result =
        action === 'rename'
          ? f.record.renameMenu('k', 'm', 'Dinner')
          : f.record.deleteMenu('k', 'm')
      f.auth.resolve(f.user)
      await Promise.resolve()
      f.token.resolve('token')
      await Promise.resolve()
      assert.equal(f.calls.length, 1)
      f.menu.value = null
      assert.equal(f.record.menu.value, null)
      assert.equal(f.record.menuId.value, '')
      f.change(change)
      f.response.resolve(f.receipt)
      assert.deepEqual(await result, f.receipt)
      const path = '/workspace/kitchen/food-and-drink/menus'
      assert.deepEqual(
        f.destinations,
        change === 'stable' ? [action === 'rename' ? path + '/food' : path] : []
      )
      assert.equal(f.notices.length, change === 'stable' ? 1 : 0)
      f.lifetime.stop()
    }
})
