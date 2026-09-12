import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { reactive, toRefs } from 'vue'

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
const initialsFor = compileFunction(
  `${stripTypeScriptTypes(source)}; return initialsFor`,
  ['reactive', 'toRefs', 'defineProps', 'withDefaults', 'defineOptions']
)(
  reactive,
  toRefs,
  () => ({}),
  (props, defaults) => reactive({ ...defaults, ...props }),
  () => {}
)

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
