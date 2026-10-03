import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  onScopeDispose,
  reactive,
  ref,
  toRefs,
  toValue,
  watch,
} from 'vue'
function load(path, expression, deps) {
  const source = readFileSync(
    new URL('../runtime/' + path, import.meta.url),
    'utf8'
  )
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${expression}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  'composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
const useEditableStringField = load(
  'composables/forms/useEditableStringField.ts',
  'useEditableStringField',
  {
    computed,
    ref,
    toValue,
    watch,
    useCommandScope,
    getCurrentInstance: () => null,
    normalizeSlug: (value) => value,
  }
)
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function context() {
  const currentUser = ref({ uid: 'actor' }),
    config = reactive({ appId: 'app' }),
    appUser = ref({ id: 'membership' })
  return {
    currentUser,
    config,
    appUser,
    deps: {
      computed,
      ref,
      reactive,
      toRefs,
      watch,
      useCommandScope,
      useAuth: () => ({ currentUser }),
      useFireUXConfig: () => config,
      useUserSession: () => ({ appUser }),
    },
  }
}
for (const action of ['save', 'clear'])
  for (const change of [
    'none',
    'account',
    'app',
    'record',
    'draft',
    'cancel',
    'disposal',
  ])
    for (const failed of [false, true]) {
      test(`string ${action} ${failed ? 'error' : 'success'} retains current ${change}`, async () => {
        const scope = effectScope(),
          c = context(),
          value = ref('original'),
          reply = deferred(),
          emitted = []
        const field = scope.run(() =>
          useEditableStringField({
            value,
            sources: [() => c.currentUser.value?.uid, () => c.config.appId],
            update: () => reply.promise,
            emitUpdated: (x) => emitted.push(x),
          })
        )
        field.startEditing()
        field.draft.value = 'submitted'
        const pending = field[action]()
        if (change === 'account') {
          c.currentUser.value = { uid: 'other' }
          c.currentUser.value = { uid: 'actor' }
        }
        if (change === 'app') {
          c.config.appId = 'other'
          c.config.appId = 'app'
        }
        if (change === 'record') {
          value.value = 'other'
          value.value = 'original'
        }
        if (change === 'draft') field.draft.value = 'newer'
        if (change === 'cancel') {
          field.cancel()
          field.startEditing()
          field.draft.value = 'newer'
        }
        if (change === 'disposal') scope.stop()
        failed ? reply.reject(new Error('Failure')) : reply.resolve()
        await pending
        assert.deepEqual(
          emitted,
          change === 'none' && !failed
            ? [action === 'clear' ? '' : 'submitted']
            : []
        )
        assert.equal(
          field.errorMessage.value,
          change === 'none' && failed ? 'Failure' : ''
        )
        assert.equal(field.isEditing.value, change !== 'none' || failed)
        assert.equal(
          field.draft.value,
          ['draft', 'cancel'].includes(change)
            ? 'newer'
            : change === 'none' && !failed && action === 'clear'
              ? ''
              : 'submitted'
        )
        if (change !== 'disposal') assert.equal(field.saving.value, false)
        scope.stop()
      })
    }
test('older string completion cannot release a newer pending save', async () => {
  const scope = effectScope(),
    first = deferred(),
    second = deferred()
  let calls = 0
  const field = scope.run(() =>
    useEditableStringField({
      value: 'original',
      update: () => (++calls === 1 ? first.promise : second.promise),
    })
  )
  field.startEditing()
  field.draft.value = 'first'
  const old = field.save()
  field.cancel()
  field.startEditing()
  field.draft.value = 'second'
  const current = field.save()
  first.resolve()
  await old
  assert.equal(field.saving.value, true)
  assert.equal(field.draft.value, 'second')
  assert.equal(field.isEditing.value, true)
  second.resolve()
  await current
  assert.equal(field.saving.value, false)
  assert.equal(field.effectiveValue.value, 'second')
  scope.stop()
})
for (const action of ['checkButtonClicked', 'deleteButtonClicked'])
  for (const change of [
    'none',
    'account',
    'app',
    'membership',
    'draft',
    'cancel',
    'disposal',
  ])
    for (const failed of [false, true]) {
      test(`array ${action} ${failed ? 'error' : 'success'} retains current ${change}`, async () => {
        const scope = effectScope(),
          c = context(),
          reply = deferred(),
          writes = [],
          props = reactive({
            value: ['original'],
            update: (values) => {
              writes.push(values)
              return reply.promise
            },
          })
        const field = scope.run(() =>
          load(
            'components/molecules/forms/editable/ArrayOfStrings.vue',
            '({startEditing,cancelEditing,checkButtonClicked,deleteButtonClicked,localValue,isEditing,errorMessage,saving})',
            { ...c.deps, defineProps: () => props }
          )
        )
        field.startEditing()
        field.localValue.value = ['submitted']
        const pending = field[action]()
        if (change === 'account') {
          c.currentUser.value = { uid: 'other' }
          c.currentUser.value = { uid: 'actor' }
        }
        if (change === 'app') {
          c.config.appId = 'other'
          c.config.appId = 'app'
        }
        if (change === 'membership') {
          c.appUser.value = null
          c.appUser.value = { id: 'membership' }
        }
        if (change === 'draft') field.localValue.value[0] = 'newer'
        if (change === 'cancel') {
          field.cancelEditing()
          field.startEditing()
          field.localValue.value = ['newer']
        }
        if (change === 'disposal') scope.stop()
        failed ? reply.reject(new Error('Failure')) : reply.resolve()
        await pending
        assert.deepEqual(writes, [
          action === 'deleteButtonClicked' ? [] : ['submitted'],
        ])
        assert.equal(field.isEditing.value, change !== 'none' || failed)
        assert.equal(
          Boolean(field.errorMessage.value),
          change === 'none' && failed
        )
        assert.deepEqual(
          field.localValue.value,
          ['draft', 'cancel'].includes(change)
            ? ['newer']
            : change === 'none' && !failed && action === 'deleteButtonClicked'
              ? []
              : ['submitted']
        )
        if (change !== 'disposal') assert.equal(field.saving.value, false)
        scope.stop()
      })
    }
test('live array changes preserve an open draft and invalidate old completion', async () => {
  const scope = effectScope(),
    c = context(),
    reply = deferred(),
    props = reactive({ value: ['original'], update: () => reply.promise })
  const field = scope.run(() =>
    load(
      'components/molecules/forms/editable/ArrayOfStrings.vue',
      '({startEditing,checkButtonClicked,localValue,isEditing})',
      { ...c.deps, defineProps: () => props }
    )
  )
  field.startEditing()
  field.localValue.value = ['draft']
  const flight = field.checkButtonClicked()
  props.value = ['live']
  await Promise.resolve()
  assert.deepEqual(field.localValue.value, ['draft'])
  reply.resolve()
  await flight
  assert.equal(field.isEditing.value, true)
  scope.stop()
})
test('old list action does not clear a new account action busy flag', async () => {
  const scope = effectScope(),
    c = context(),
    first = deferred(),
    second = deferred()
  let calls = 0
  const props = reactive({
    items: [{ id: 'request', title: 'Request' }],
    actionApprove: () => (++calls === 1 ? first.promise : second.promise),
  })
  const list = scope.run(() =>
    load(
      'components/molecules/forms/editable/ListActions.vue',
      '({handleApprove,isBusy})',
      {
        ...c.deps,
        defineProps: () => props,
        withDefaults: (x) => x,
        defineOptions() {},
      }
    )
  )
  const old = list.handleApprove('request')
  c.currentUser.value = { uid: 'other' }
  const current = list.handleApprove('request')
  first.resolve()
  await old
  assert.equal(list.isBusy('request'), true)
  second.resolve()
  await current
  assert.equal(list.isBusy('request'), false)
  scope.stop()
})
test('older image upload cannot clear a later file selection', async () => {
  const scope = effectScope(),
    c = context(),
    first = deferred(),
    second = deferred()
  let calls = 0
  const props = reactive({
    update: () => (++calls === 1 ? first.promise : second.promise),
  })
  const image = scope.run(() =>
    load(
      'components/molecules/forms/editable/ImagePicker.vue',
      '({onFileChange})',
      { ...c.deps, defineProps: () => props }
    )
  )
  const input = { value: 'first', files: [{}] }
  const old = image.onFileChange({ target: input })
  input.value = 'second'
  const current = image.onFileChange({ target: input })
  first.resolve()
  await old
  assert.equal(input.value, 'second')
  second.resolve()
  await current
  assert.equal(input.value, '')
  scope.stop()
})

test('owner intent round trip with identical scalar fields suppresses field completion', async () => {
  const scope = effectScope(),
    record = ref('first'),
    reply = deferred(),
    emitted = []
  const capture = scope.run(() => useCommandScope([record]))
  const field = scope.run(() =>
    useEditableStringField({
      value: 'same',
      captureIntent: capture,
      update: () => reply.promise,
      emitUpdated: (value) => emitted.push(value),
    })
  )
  field.startEditing()
  field.draft.value = 'new'
  const flight = field.save()
  record.value = 'other'
  record.value = 'first'
  reply.resolve()
  await flight
  assert.deepEqual(emitted, [])
  assert.equal(field.isEditing.value, true)
  assert.equal(field.saving.value, false)
  scope.stop()
})
test('field exposes its current draft predicate to the existing parent completion handler', async () => {
  const scope = effectScope(),
    reply = deferred()
  let parentCurrent
  const field = scope.run(() =>
    useEditableStringField({
      value: 'old',
      update: (_value, isCurrent) => {
        parentCurrent = isCurrent
        return reply.promise
      },
    })
  )
  field.startEditing()
  field.draft.value = 'submitted'
  const flight = field.save()
  assert.equal(parentCurrent(), true)
  field.cancel()
  field.startEditing()
  assert.equal(parentCurrent(), false)
  reply.resolve()
  await flight
  assert.equal(field.isEditing.value, true)
  scope.stop()
})
for (const change of ['none', 'account', 'app', 'record', 'draft', 'disposal'])
  for (const failed of [false, true]) {
    test(`User field parent ${failed ? 'error' : 'success'} respects ${change}`, async () => {
      const scope = effectScope(),
        c = context(),
        reply = deferred(),
        notices = [],
        props = reactive({
          user: { id: 'actor', display_name: 'User' },
          outcome: 'ready',
        })
      let currentDraft = true
      const parent = scope.run(() =>
        load('user/components/Edit/Core.vue', '({handleUpdateDisplayName})', {
          ...c.deps,
          defineProps: () => props,
          useToastify: () => ({
            success: (x) => notices.push(x),
            error: (x) => notices.push(x),
          }),
          useUserProfileUpdate: () => ({ name: () => reply.promise }),
          useAvatarProxy: () => ({ useProxiedAvatar: () => ref('') }),
          useUserFormattingAndValidation: () => ({
            DisplayName: {},
            Bio: {},
            Handle: {},
          }),
        })
      )
      const pending = parent.handleUpdateDisplayName('new', () => currentDraft)
      const done =
        failed && change === 'none'
          ? assert.rejects(pending, /Failure/)
          : pending
      if (change === 'account') {
        c.currentUser.value = { uid: 'other' }
        c.currentUser.value = { uid: 'actor' }
      }
      if (change === 'app') {
        c.config.appId = 'other'
        c.config.appId = 'app'
      }
      if (change === 'record') {
        props.user.id = 'other'
        props.user.id = 'actor'
      }
      if (change === 'draft') currentDraft = false
      if (change === 'disposal') scope.stop()
      failed ? reply.reject(new Error('Failure')) : reply.resolve()
      await done
      assert.equal(notices.length, change === 'none' ? 1 : 0)
      scope.stop()
    })
  }


test('owner-scoped field completes when its parent disables editing during its own save', async () => {
  const scope = effectScope(), disabled = ref(false), reply = deferred(), emitted = []
  const field = scope.run(() => useEditableStringField({
    value: 'original', disabled, captureIntent: () => () => true,
    update: async () => { disabled.value = true; await reply.promise; disabled.value = false },
    emitUpdated: value => emitted.push(value),
  }))
  field.startEditing()
  field.draft.value = 'submitted'
  const pending = field.save()
  assert.equal(field.saving.value, true)
  reply.resolve()
  await pending
  assert.equal(field.isEditing.value, false)
  assert.equal(field.saving.value, false)
  assert.deepEqual(emitted, ['submitted'])
  scope.stop()
})

for (const transition of ['stable', 'cancel', 'new-edit', 'dispose']) test(`object-array save: ${transition} retains the current draft`, async () => {
  const gate = deferred(), scope = effectScope(), props = reactive({value:[{name:'first'},{name:'second'}],update:async()=>gate.promise})
  const api = scope.run(() => load('components/molecules/forms/editable/ObjectArray.vue', '{startItemEditing,cancelItemEditing,saveItemEditing,editingIndex,draftItem,captureIntent}', {computed,ref,useSlots:()=>({}),defineProps:()=>props,defineExpose:()=>{},useCommandScope,defaultObjectArrayDateSortFields:{},objectArrayHasDateFields:()=>false,sortObjectArrayByDate:items=>items}))
  api.startItemEditing(0)
  const editorCurrent = api.captureIntent(), flight = api.saveItemEditing()
  if (transition==='cancel') api.cancelItemEditing()
  if (transition==='new-edit') { api.cancelItemEditing(); api.startItemEditing(1) }
  if (transition==='dispose') scope.stop()
  gate.resolve(); await flight
  assert.equal(api.editingIndex.value, transition==='new-edit'?1:transition==='dispose'?0:null)
  if (transition==='new-edit') assert.equal(api.draftItem.value.name,'second')
  if (transition!=='stable') assert.equal(editorCurrent(),false)
  scope.stop()
})
