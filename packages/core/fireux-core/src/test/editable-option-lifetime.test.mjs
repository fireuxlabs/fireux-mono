import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  compile,
  computed,
  createRenderer,
  h,
  nextTick,
  onScopeDispose,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue'

const runtime = new URL('../runtime/', import.meta.url)
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  'composables/fireux/commands/useCommandScope.ts',
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
const renderer = createRenderer({
  createElement: (type) => ({ type, children: [], props: {} }),
  createText: (text) => ({ text }),
  createComment: (text) => ({ text }),
  insert: (node, parent) => {
    parent.children.push(node)
    node.parent = parent
  },
  remove: (node) => {
    if (node.parent)
      node.parent.children = node.parent.children.filter(
        (child) => child !== node
      )
  },
  parentNode: (node) => node.parent,
  nextSibling: () => null,
  patchProp: (node, key, old, value) => {
    node.props[key] = value
  },
  setText: (node, text) => {
    node.text = text
  },
  setElementText: (node, text) => {
    node.text = text
  },
})
function fixture(kind, explicitOwner = false) {
  const currentUser = ref({ uid: 'actor' }),
    config = reactive({ appId: 'app' }),
    appUser = ref({ id: 'actor', created: { at: 1 } }),
    owner = ref('record')
  const updates = [],
    warnings = [],
    root = { children: [] }
  let update = async () => ({ committed: true }),
    field
  const props = reactive({
    label: 'Setting',
    value: kind === 'Checkbox' ? false : 'original',
    disabled: false,
    options: ['original', 'submitted', 'newer', 'foreign'],
    captureIntent: undefined,
    update: (value, isCurrent) => {
      updates.push({ value, isCurrent })
      return update(value, isCurrent)
    },
  })
  const path = `components/Molecules/Forms/Editable/${kind}.vue`
  const source = readFileSync(new URL(path, runtime), 'utf8'),
    body = source.split('<template>')[1].split('</template>')[0]
  const render = compile(body, {
    onError: (error) => {
      throw error
    },
    onWarn: (warning) => warnings.push(warning),
  })
  const app = renderer.createApp({
    setup() {
      if (explicitOwner) props.captureIntent = useCommandScope([owner])
      field = load(
        path,
        `({startEditing,cancel,save,${kind === 'Select' ? 'clear,normalizedOptions,displayValue,' : ''}draft,isEditing,saving,optimisticValue,effectiveValue,errorMessage})`,
        {
          computed,
          ref,
          watch,
          useCommandScope,
          useAuth: () => ({ currentUser }),
          useFireUXConfig: () => config,
          useUserSession: () => ({ appUser }),
          defineProps: () => props,
          withDefaults: (value, defaults) => {
            for (const [key, item] of Object.entries(defaults))
              if (value[key] === undefined) value[key] = item
            return value
          },
        }
      )
      return { ...toRefs(props), ...field }
    },
    render,
  })
  app.config.warnHandler = (warning) => warnings.push(warning)
  app.component('FireFormsTop', {
    props: [
      'label',
      'isEditing',
      'hasData',
      'errorMessage',
      'disabled',
      'disabledMessage',
    ],
    emits: ['start-editing', 'check', 'cancel', 'delete'],
    setup:
      (props, { emit }) =>
      () =>
        h(
          'div',
          { control: 'top' },
          ['start-editing', 'check', 'cancel', 'delete'].map((event) =>
            h('button', { action: event, onClick: () => emit(event) }, event)
          )
        ),
  })
  app.component('UBadge', {
    props: ['color', 'variant'],
    setup:
      (props, { slots }) =>
      () =>
        h('span', slots.default?.()),
  })
  for (const name of ['USwitch', 'USelect'])
    app.component(name, {
      props: [
        'modelValue',
        'label',
        'disabled',
        'items',
        'placeholder',
        'valueKey',
        'labelKey',
      ],
      emits: ['update:modelValue'],
      setup: (props) => () =>
        h('input', {
          control: name,
          disabled: props.disabled,
          value: props.modelValue,
        }),
    })
  app.mount(root)
  let stopped = false
  return {
    props,
    field,
    currentUser,
    config,
    appUser,
    owner,
    updates,
    warnings,
    root,
    submitted: kind === 'Checkbox' ? true : 'submitted',
    original: kind === 'Checkbox' ? false : 'original',
    newer: kind === 'Checkbox' ? false : 'newer',
    reply(fn) {
      update = fn
    },
    stop() {
      if (!stopped) {
        stopped = true
        app.unmount()
      }
      assert.deepEqual(warnings, [])
    },
  }
}
const actions = [
  ['Checkbox', 'save'],
  ['Select', 'save'],
  ['Select', 'clear'],
]
function input(root) {
  if (root.type === 'input') return root
  return root.children?.map(input).find(Boolean)
}

for (const [kind, action] of actions) {
  test(`${kind} ${action} snapshots authored values and accepts its own live acknowledgement with parent busy`, async () => {
    const f = fixture(kind, true),
      response = deferred(),
      result = { committed: true }
    f.field.startEditing()
    f.field.draft.value = f.submitted
    f.reply(async (value, isCurrent) => {
      f.props.disabled = true
      assert.equal(isCurrent(), true)
      return response.promise
    })
    const work = f.field[action](),
      authored = action === 'clear' ? '' : f.submitted
    assert.equal(f.updates[0].value, authored)
    assert.equal(typeof f.updates[0].isCurrent, 'function')
    f.props.value = authored
    await nextTick()
    assert.equal(f.field.saving.value, true)
    assert.equal(f.updates[0].isCurrent(), true)
    assert.equal(input(f.root).props.disabled, true)
    response.resolve(result)
    assert.deepEqual(await work, result)
    assert.equal(f.field.effectiveValue.value, authored)
    assert.equal(f.field.draft.value, authored)
    assert.equal(f.field.isEditing.value, false)
    assert.equal(f.field.saving.value, false)
    f.stop()
  })
}

for (const [kind, action] of actions) {
  test(`${kind} ${action} forwards cancellation, draft ABA and disposal before a delayed dispatch`, async () => {
    for (const change of [
      'cancel',
      'draft ABA',
      'disposal',
      'owner ABA',
      'account ABA',
      'App ABA',
      'membership ABA',
      'disabled ABA',
    ]) {
      const f = fixture(kind, change === 'owner ABA'),
        credentials = deferred(),
        dispatches = []
      f.field.startEditing()
      f.field.draft.value = f.submitted
      f.reply(async (value, isCurrent) => {
        await credentials.promise
        if (!isCurrent()) throw new Error('Obsolete intent')
        dispatches.push(value)
        return { committed: true }
      })
      const work = f.field[action]()
      if (change === 'cancel') f.field.cancel()
      if (change === 'draft ABA') {
        f.field.draft.value = f.newer
        f.field.draft.value = f.submitted
      }
      if (change === 'disposal') f.stop()
      if (change === 'owner ABA') {
        f.owner.value = 'other'
        f.owner.value = 'record'
      }
      if (change === 'account ABA') {
        const original = f.currentUser.value
        f.currentUser.value = null
        f.currentUser.value = original
      }
      if (change === 'App ABA') {
        f.config.appId = 'other'
        f.config.appId = 'app'
      }
      if (change === 'membership ABA') {
        const original = f.appUser.value
        f.appUser.value = null
        f.appUser.value = original
      }
      if (change === 'disabled ABA') {
        f.props.disabled = true
        f.props.disabled = false
      }
      const before = {
        draft: f.field.draft.value,
        editing: f.field.isEditing.value,
        saving: f.field.saving.value,
      }
      credentials.resolve()
      await work
      assert.deepEqual(dispatches, [], change)
      assert.equal(f.field.optimisticValue.value, null, change)
      assert.equal(f.field.errorMessage.value, '', change)
      assert.equal(f.field.draft.value, before.draft, change)
      assert.equal(f.field.isEditing.value, before.editing, change)
      if (change !== 'owner ABA')
        assert.equal(f.field.saving.value, before.saving, change)
      f.stop()
    }
  })
}

test('Select clear cancellation is explicit even when no editor or draft value changed', async () => {
  const f = fixture('Select'),
    wait = deferred(),
    dispatches = []
  f.reply(async (value, isCurrent) => {
    await wait.promise
    if (!isCurrent()) throw new Error('Cancelled')
    dispatches.push(value)
  })
  const work = f.field.clear()
  assert.equal(f.field.isEditing.value, false)
  f.field.cancel()
  wait.resolve()
  await work
  assert.deepEqual(dispatches, [])
  assert.equal(f.field.saving.value, false)
  assert.equal(f.field.effectiveValue.value, 'original')
  f.stop()
})

for (const kind of ['Checkbox', 'Select']) {
  test(`${kind} preserves an authored dirty draft during background values and hydrates only after editing ends`, async () => {
    const f = fixture(kind)
    f.field.startEditing()
    f.field.draft.value = f.submitted
    f.props.value = kind === 'Checkbox' ? true : 'foreign'
    await nextTick()
    assert.equal(f.field.draft.value, f.submitted)
    assert.equal(f.field.isEditing.value, true)
    f.props.value = f.original
    await nextTick()
    assert.equal(f.field.draft.value, f.submitted)
    f.field.cancel()
    f.props.value = kind === 'Checkbox' ? true : 'foreign'
    await nextTick()
    assert.equal(f.field.draft.value, f.props.value)
    assert.equal(f.field.effectiveValue.value, f.props.value)
    f.stop()
  })
  test(`${kind} a foreign live revision cannot be rescued by an equal acknowledgement`, async () => {
    const f = fixture(kind),
      response = deferred(),
      result = { committed: true }
    f.field.startEditing()
    f.field.draft.value = f.submitted
    f.reply(() => response.promise)
    const work = f.field.save()
    f.props.value = f.submitted
    f.props.value = kind === 'Checkbox' ? false : 'foreign'
    f.props.value = f.submitted
    assert.equal(f.updates[0].isCurrent(), false)
    response.resolve(result)
    assert.deepEqual(await work, result)
    assert.equal(f.field.optimisticValue.value, null)
    assert.equal(f.field.isEditing.value, true)
    assert.equal(f.field.draft.value, f.submitted)
    assert.equal(f.field.errorMessage.value, '')
    f.stop()
  })
}

for (const [kind, action] of actions) {
  test(`${kind} ${action} disposed or cancelled completions stay quiet and cannot clear a newer busy request`, async () => {
    for (const change of ['disposal', 'new edit'])
      for (const failed of [false, true]) {
        const f = fixture(kind),
          old = deferred(),
          newer = deferred(),
          result = { committed: true }
        let calls = 0
        f.reply(() => (++calls === 1 ? old.promise : newer.promise))
        f.field.startEditing()
        f.field.draft.value = f.submitted
        const work = f.field[action]()
        let newWork
        if (change === 'disposal') f.stop()
        else {
          f.field.cancel()
          f.field.startEditing()
          f.field.draft.value = f.submitted
          newWork = f.field[action]()
          assert.equal(f.field.saving.value, true)
        }
        const before = {
          draft: f.field.draft.value,
          editing: f.field.isEditing.value,
          saving: f.field.saving.value,
        }
        if (failed) old.reject(new Error('Historical error'))
        else old.resolve(result)
        assert.deepEqual(await work, failed ? undefined : result)
        assert.equal(f.field.optimisticValue.value, null)
        assert.equal(f.field.errorMessage.value, '')
        assert.equal(f.field.draft.value, before.draft)
        assert.equal(f.field.isEditing.value, before.editing)
        assert.equal(f.field.saving.value, before.saving)
        if (newWork) {
          newer.resolve(result)
          await newWork
          assert.equal(f.field.saving.value, false)
          assert.equal(f.field.isEditing.value, false)
        }
        f.stop()
      }
  })
}

for (const kind of ['Checkbox', 'Select']) {
  test(`${kind} disabled controls reject native and programmatic saves and expose only current errors`, async () => {
    const f = fixture(kind)
    f.props.disabled = true
    f.field.startEditing()
    assert.equal(f.field.isEditing.value, false)
    await f.field.save()
    if (kind === 'Select') await f.field.clear()
    assert.deepEqual(f.updates, [])
    f.props.disabled = false
    f.field.startEditing()
    f.field.draft.value = f.submitted
    f.props.disabled = true
    await nextTick()
    assert.equal(input(f.root).props.disabled, true)
    await f.field.save()
    assert.deepEqual(f.updates, [])
    f.props.disabled = false
    f.reply(async () => {
      throw new Error('Current failure')
    })
    await f.field.save()
    assert.equal(f.field.errorMessage.value, 'Current failure')
    assert.equal(f.field.saving.value, false)
    assert.equal(f.field.isEditing.value, true)
    f.stop()
  })
}
