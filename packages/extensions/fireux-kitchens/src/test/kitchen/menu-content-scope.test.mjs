import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch } from 'vue'
function load(path, deps, result, vue = false) {
  deps = commandScopeDeps(deps)
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (vue)
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
function scope(currentUser, disposed = []) {
  return load(
    '../../runtime/menu/composables/useMenuEditorScope.ts',
    {
      watch,
      onBeforeUnmount: (fn) => disposed.push(fn),
      useAuth: () => ({ currentUser }),
    },
    'useMenuEditorScope'
  )
}
test('Menu section/item adapters capture exact bodies and invalidate credential/response roundtrips', async () => {
  for (const adapter of [
    'section-create',
    'section-update',
    'item-create',
    'item-update',
  ])
    for (const stage of ['auth', 'token', 'response'])
      for (const change of [
        'stable',
        'account',
        'kitchen',
        'route',
        'logout',
        'dispose',
      ]) {
        const auth = deferred(),
          token = deferred(),
          response = deferred(),
          calls = [],
          disposed = []
        const user = { uid: 'u', getIdToken: () => token.promise },
          currentUser = ref(user),
          selectedId = ref('k'),
          routePath = ref('/menus/m')
        const useMenuMutation = load(
          '../../runtime/menu/composables/firestore/mutations/useMenuMutation.ts',
          {
            useRoute: () => ({
              get fullPath() {
                return routePath.value
              },
            }),
            useAuth: () => ({ currentUser }),
            useRequireUser: () => auth.promise,
            useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
            useKitchenWorkspaceSelection: () => ({ selectedId }),
            useMenuEditorScope: scope(currentUser, disposed),
            $fetch: (...args) => {
              calls.push(args)
              return response.promise
            },
          },
          'useMenuMutation'
        )
        const isSection = adapter.startsWith('section'),
          isCreate = adapter.endsWith('create')
        const name = isSection
          ? 'useMenuSectionMutations'
          : 'useMenuItemMutations'
        const api = load(
          `../../runtime/menu/composables/firestore/mutations/${name}.ts`,
          { useMenuMutation, normalizeMenuItemPatch: (x) => x },
          name
        )()
        const input = isSection
          ? { kitchenId: 'k', menuId: 'm', label: 'Lunch' }
          : {
              kitchenId: 'k',
              menuId: 'm',
              sectionId: 's',
              dishId: 'd',
              price: 13,
            }
        const patch = isSection
          ? { label: 'Lunch' }
          : { price_options: [{ label: 'Large', price: 15 }] }
        const expected = isCreate
          ? structuredClone(input)
          : isSection
            ? {
                kitchenId: 'k',
                menuId: 'm',
                sectionId: 's',
                changes: structuredClone(patch),
              }
            : {
                kitchenId: 'k',
                menuId: 'm',
                sectionId: 's',
                itemId: 'i',
                changes: structuredClone(patch),
              }
        const pending = isCreate
          ? isSection
            ? api.createSection(input)
            : api.createItem(input)
          : isSection
            ? api.updateSection('k', 'm', 's', patch)
            : api.updateItem('k', 'm', 's', 'i', patch)
        const done =
          change === 'stable' || stage === 'response'
            ? pending
            : assert.rejects(pending, /changed/)
        if (stage !== 'auth') {
          auth.resolve(user)
          await Promise.resolve()
        }
        if (stage === 'response') {
          token.resolve('token')
          await Promise.resolve()
        }
        input.menuId = 'other'
        if (isSection) patch.label = 'Changed'
        else patch.price_options[0].price = 99
        if (change === 'kitchen') {
          selectedId.value = 'b'
          selectedId.value = 'k'
        } else if (change === 'route') {
          routePath.value = '/menus/b'
          routePath.value = '/menus/m'
        } else if (change === 'dispose') disposed.forEach((fn) => fn())
        else if (change === 'account' || change === 'logout') {
          currentUser.value = change === 'logout' ? null : { uid: 'b' }
          currentUser.value = user
        }
        auth.resolve(user)
        token.resolve('token')
        response.resolve({ id: 'new', kitchenId: 'k', menuId: 'm' })
        await done
        assert.equal(
          calls.length,
          change === 'stable' || stage === 'response' ? 1 : 0
        )
        if (calls.length) {
          assert.deepEqual(calls[0][1].body, expected)
          assert.equal(calls[0][1].method, isCreate ? 'POST' : 'PATCH')
        }
      }
})
test('Section Create/label editor suppress obsolete success/error and keep new pending state', async () => {
  for (const action of ['addSection', 'saveSectionLabel'])
    for (const change of ['stable', 'menu', 'account', 'date'])
      for (const failed of [false, true]) {
        const pending = deferred(),
          toasts = [],
          currentUser = ref({ uid: 'u' }),
          kitchenId = ref('k'),
          menuId = ref('m'),
          selectedDate = ref('2026-10-01')
        const api = load(
          '../../runtime/kitchen/composables/workspace/menus/useMenuSectionsEditor.ts',
          {
            ref,
            computed,
            useState: () => selectedDate,
            useMenuEditorScope: scope(currentUser),
            useToastify: () => ({ add: (x) => toasts.push(x) }),
            useKitchenMenuRecordContext: () => ({
              menu: ref({ schedule: 'regular' }),
              source: ref(null),
              menuId,
              menuSlug: ref('food'),
              kitchenId,
              sections: ref([]),
              sectionsPending: ref(false),
              sectionsError: ref(null),
              canWrite: ref(true),
              createSection: () => pending.promise,
              updateSection: () => pending.promise,
            }),
          },
          'useMenuSectionsEditor()'
        )
        api.newSectionLabel.value = 'Lunch'
        const result =
          action === 'addSection'
            ? api.addSection()
            : api.saveSectionLabel('s', 'Lunch')
        const done =
          failed && change === 'stable' && action === 'saveSectionLabel'
            ? assert.rejects(result, /Failure/)
            : result
        if (change === 'menu') {
          menuId.value = 'b'
          menuId.value = 'm'
        } else if (change === 'account') {
          currentUser.value = null
          currentUser.value = { uid: 'u' }
        } else if (change === 'date') {
          selectedDate.value = '2026-10-02'
          selectedDate.value = '2026-10-01'
        }
        if (change !== 'stable') api.savingSection.value = true
        failed ? pending.reject(Error('Failure')) : pending.resolve('new')
        await done
        assert.equal(toasts.length, change === 'stable' ? 1 : 0)
        if (change !== 'stable') assert.equal(api.savingSection.value, true)
      }
})
test('Item Create snapshots selected Dish and drops stale completion', async () => {
  for (const change of ['stable', 'section', 'account'])
    for (const failed of [false, true]) {
      const pending = deferred(),
        toasts = [],
        calls = [],
        currentUser = ref({ uid: 'u' }),
        kitchenId = ref('k'),
        menuId = ref('m'),
        sectionId = ref('s')
      const api = load(
        '../../runtime/kitchen/components/Workspace/Menus/Items/Add/Repertoire.vue',
        {
          ref,
          computed,
          watch,
          useMenuEditorScope: scope(currentUser),
          useToastify: () => ({ add: (x) => toasts.push(x) }),
          useKitchenWorkspaceMenuSection: () => ({
            kitchenId,
            menuId,
            sectionId,
            section: ref({}),
            dishes: ref([]),
            itemRows: ref([]),
            canWrite: ref(true),
            createItem: (x) => {
              calls.push(x)
              return pending.promise
            },
          }),
        },
        '({add,dishId,saving})',
        true
      )
      api.dishId.value = 'd'
      const result = api.add()
      api.dishId.value = 'other'
      if (change === 'section') {
        sectionId.value = 'b'
        sectionId.value = 's'
      } else if (change === 'account') {
        currentUser.value = null
        currentUser.value = { uid: 'u' }
      }
      if (change !== 'stable') api.saving.value = true
      failed ? pending.reject(Error('Failure')) : pending.resolve('new')
      await result
      assert.equal(calls[0].dishId, 'd')
      assert.equal(calls[0].price, undefined)
      assert.equal(toasts.length, change === 'stable' ? 1 : 0)
      if (change !== 'stable') assert.equal(api.saving.value, true)
    }
})
