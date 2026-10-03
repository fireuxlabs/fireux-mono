import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { reactive, toRefs, ref, watch, onScopeDispose, effectScope } from 'vue'

const component = readFileSync(
  new URL(
    '../runtime/components/molecules/forms/editable/ListActions.vue',
    import.meta.url
  ),
  'utf8'
)
const source = component
  .split('<script setup lang="ts">')[1]
  .split('</script>')[0]
  .replace(/^import[^\n]+\n/gm, '')
const commandSource = readFileSync(
  new URL(
    '../runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(commandSource)}; return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)
const scope = effectScope()
const initialsFor = scope.run(() =>
  compileFunction(`${stripTypeScriptTypes(source)}; return initialsFor`, [
    'reactive',
    'toRefs',
    'defineProps',
    'withDefaults',
    'defineOptions',
    'watch',
    'useCommandScope',
    'useAuth',
    'useFireUXConfig',
    'useUserSession',
  ])(
    reactive,
    toRefs,
    () => ({ items: [] }),
    (props, defaults) => reactive({ ...defaults, ...props }),
    () => {},
    watch,
    useCommandScope,
    () => ({ currentUser: ref(null) }),
    () => ({ appId: 'app' }),
    () => ({ appUser: ref(null) })
  )
)
scope.stop()

test('editable-list initials handle blank, single-word and multiword titles', () => {
  for (const [title, expected] of [
    ['', '·'],
    ['   ', '·'],
    ['a', 'A'],
    ['Daniel', 'D'],
    ['  Daniel  Watson  ', 'DW'],
    ['Daniel James Watson', 'DW'],
  ]) {
    assert.equal(initialsFor({ id: 'member', title }), expected)
  }
  assert.equal(
    initialsFor({
      id: 'member',
      title: 'Daniel Watson',
      initials: 'chef dean',
    }),
    'CD'
  )
})
