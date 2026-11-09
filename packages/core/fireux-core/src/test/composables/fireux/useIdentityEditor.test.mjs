import assert from 'node:assert/strict'
import test from 'node:test'
import { computed, effectScope, ref, toRaw } from 'vue'
import { useIdentityEditor } from '../../../runtime/composables/fireux/useIdentityEditor.ts'

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

const shapes = [
  {
    name: 'Project',
    initial: () => ({
      name: 'Original project',
      description: 'Saved description',
      imageUrl: 'https://example.test/project.png',
      status: 'inactive',
    }),
    signature: (draft) =>
      JSON.stringify([
        draft.name.trim(),
        draft.description.trim(),
        draft.imageUrl.trim(),
        draft.status,
      ]),
    edit: (draft, value) => {
      draft.name = value
    },
    value: (draft) => draft.name,
  },
  {
    name: 'Kitchen',
    initial: () => ({
      slug: 'original-kitchen',
      status: 'active',
      visibility: true,
    }),
    signature: (draft) =>
      JSON.stringify([draft.slug.trim(), draft.status, draft.visibility]),
    edit: (draft, value) => {
      draft.slug = value
    },
    value: (draft) => draft.slug,
  },
]

function fixture(shape) {
  const owner = effectScope()
  const open = ref(false)
  const account = ref('actor')
  const root = ref('root-a')
  const readiness = ref('ready')
  const allowed = ref(true)
  const source = ref(shape.initial())
  const attempts = []
  const dispatched = []
  const successes = []
  const editor = owner.run(() =>
    useIdentityEditor({
      open,
      scope: [account, root, readiness],
      canEdit: computed(() => allowed.value && readiness.value === 'ready'),
      createDraft: () => ({ ...source.value }),
      signature: shape.signature,
      save: async (snapshot, isCurrent) => {
        const credentials = deferred()
        const response = deferred()
        const attempt = { snapshot, isCurrent, credentials, response }
        attempts.push(attempt)
        await credentials.promise
        if (!isCurrent()) throw new Error('The editor changed before dispatch.')
        dispatched.push(structuredClone(snapshot))
        return response.promise
      },
      onSaved: () => {
        successes.push(shape.value(editor.draft.value))
        open.value = false
      },
      errorMessage: 'Identity could not be saved.',
    })
  )
  return {
    owner,
    open,
    account,
    root,
    readiness,
    allowed,
    source,
    attempts,
    dispatched,
    successes,
    editor,
  }
}

function prepare(h, shape, value = 'reviewed') {
  assert.equal(
    h.editor.begin((draft) => shape.edit(draft, value)),
    true
  )
}

function change(h, shape, kind) {
  if (kind === 'account') {
    h.account.value = 'another-actor'
    h.account.value = 'actor'
  } else if (kind === 'root') {
    h.root.value = 'root-b'
    h.root.value = 'root-a'
  } else if (kind === 'readiness') {
    h.readiness.value = 'pending'
    h.readiness.value = 'ready'
  } else if (kind === 'permission') {
    h.allowed.value = false
    h.allowed.value = true
  } else if (kind === 'closed') h.open.value = false
  else if (kind === 'reopened') {
    h.open.value = false
    prepare(h, shape, 'new session')
  } else if (kind === 'draft') {
    shape.edit(h.editor.draft.value, 'changed draft')
  } else if (kind === 'draft round trip') {
    shape.edit(h.editor.draft.value, 'changed draft')
    shape.edit(h.editor.draft.value, 'reviewed')
  } else if (kind === 'saved source') {
    shape.edit(h.source.value, 'external update')
  } else if (kind === 'proposal') prepare(h, shape, 'new proposal')
  else if (kind === 'disposed') h.owner.stop()
}

const kitchen = shapes[1]
for (const listenerFirst of [true, false]) {
  test(`a confirmed save becomes the baseline for continued editing (${listenerFirst ? 'listener' : 'response'} first)`, async () => {
    const h = fixture(kitchen)
    prepare(h, kitchen)
    const flight = h.editor.save()
    const attempt = h.attempts[0]
    attempt.credentials.resolve()
    await flush()
    assert.equal(h.dispatched.length, 1)
    kitchen.edit(h.editor.draft.value, 'original-kitchen')
    assert.equal(attempt.isCurrent(), false)

    if (listenerFirst) h.source.value = { ...attempt.snapshot }
    attempt.response.resolve()
    await flight
    assert.equal(h.editor.changed.value, true)
    if (!listenerFirst) h.source.value = { ...attempt.snapshot }
    assert.equal(h.editor.draft.value.slug, 'original-kitchen')
    assert.equal(h.editor.changed.value, true)
    assert.equal(h.open.value, true)
    assert.deepEqual(h.successes, [])
    kitchen.edit(h.editor.draft.value, '  reviewed  ')
    assert.equal(
      h.editor.changed.value,
      false,
      'the baseline uses the submitted signature'
    )
    h.owner.stop()
  })
}

test('obsolete responses cannot set the baseline for another edit or overwrite a foreign source revision', async () => {
  for (const boundary of [
    'reopened',
    'new attempt',
    'disposed',
    'saved source',
  ]) {
    const h = fixture(kitchen)
    prepare(h, kitchen)
    const first = h.editor.save()
    h.attempts[0].credentials.resolve()
    await flush()
    if (boundary === 'reopened' || boundary === 'new attempt') {
      h.open.value = false
      prepare(h, kitchen)
    } else {
      change(h, kitchen, boundary)
      if (boundary === 'saved source') {
        // A later matching echo cannot erase the intervening foreign update.
        h.source.value = { ...h.attempts[0].snapshot }
      }
    }
    // The identical draft is still an edit relative to this session's baseline.
    const second = boundary === 'new attempt' ? h.editor.save() : undefined
    h.attempts[0].response.resolve()
    await first
    assert.equal(h.editor.changed.value, true, boundary)
    assert.deepEqual(h.successes, [], boundary)
    if (second) {
      assert.equal(h.editor.saving.value, true)
      assert.equal(h.attempts[1].isCurrent(), true)
      h.attempts[1].credentials.resolve()
      h.attempts[1].response.resolve()
      await second
    }
    h.owner.stop()
  }
})

for (const shape of shapes) {
  test(`${shape.name} controlled opening loads current saved fields without requiring begin`, () => {
    const h = fixture(shape)
    shape.edit(h.source.value, 'latest saved fields')
    h.open.value = true
    assert.equal(shape.value(h.editor.draft.value), 'latest saved fields')
    assert.equal(h.editor.changed.value, false)
    shape.edit(h.editor.draft.value, 'unsaved draft')
    h.open.value = false
    shape.edit(h.source.value, 'reloaded saved fields')
    h.open.value = true
    assert.equal(shape.value(h.editor.draft.value), 'reloaded saved fields')
    assert.equal(h.editor.changed.value, false)
    h.owner.stop()
  })

  test(`${shape.name} editor initializes a detached draft, tracks semantic dirtiness and resets on every begin`, () => {
    const h = fixture(shape)
    assert.equal(h.editor.begin(), true)
    assert.equal(h.open.value, true)
    assert.deepEqual(h.editor.draft.value, shape.initial())
    assert.notEqual(h.editor.draft.value, h.source.value)
    assert.equal(h.editor.changed.value, false)
    shape.edit(h.editor.draft.value, ` ${shape.value(shape.initial())} `)
    assert.equal(
      h.editor.changed.value,
      false,
      'domain signature owns normalization'
    )
    shape.edit(h.editor.draft.value, 'changed')
    assert.equal(h.editor.changed.value, true)
    assert.deepEqual(
      h.source.value,
      shape.initial(),
      'editing does not change saved data'
    )
    h.editor.begin()
    assert.deepEqual(h.editor.draft.value, shape.initial())
    assert.equal(h.editor.changed.value, false)
    h.owner.stop()
  })

  test(`${shape.name} current save uses its captured draft and publishes success once`, async () => {
    const h = fixture(shape)
    prepare(h, shape)
    const flight = h.editor.save()
    assert.equal(h.editor.saving.value, true)
    assert.equal(h.attempts.length, 1)
    assert.notEqual(h.attempts[0].snapshot, h.editor.draft.value)
    assert.equal(shape.value(h.attempts[0].snapshot), 'reviewed')
    await h.editor.save()
    assert.equal(
      h.attempts.length,
      1,
      'a busy editor does not duplicate the command'
    )
    h.attempts[0].credentials.resolve()
    await flush()
    assert.deepEqual(h.dispatched, [h.attempts[0].snapshot])
    h.attempts[0].response.resolve()
    await flight
    assert.deepEqual(h.successes, ['reviewed'])
    assert.equal(h.open.value, false)
    assert.equal(h.editor.saving.value, false)
    assert.equal(h.editor.error.value, '')
    h.owner.stop()
  })

  test(`${shape.name} listener acknowledgement preserves current save completion without replacing the draft`, async () => {
    const h = fixture(shape)
    prepare(h, shape)
    const flight = h.editor.save()
    h.attempts[0].credentials.resolve()
    await flush()
    h.source.value = structuredClone(h.attempts[0].snapshot)
    assert.equal(h.attempts[0].isCurrent(), true)
    assert.equal(shape.value(h.editor.draft.value), 'reviewed')
    h.attempts[0].response.resolve()
    await flight
    assert.deepEqual(h.successes, ['reviewed'])
    h.owner.stop()
  })

  test(`${shape.name} later matching source cannot revive a save invalidated by an unrelated source change`, async () => {
    const h = fixture(shape)
    prepare(h, shape)
    const flight = h.editor.save()
    shape.edit(h.source.value, 'external update')
    h.source.value = structuredClone(h.attempts[0].snapshot)
    assert.equal(h.attempts[0].isCurrent(), false)
    h.attempts[0].credentials.resolve()
    await flight
    assert.deepEqual(h.dispatched, [])
    assert.deepEqual(h.successes, [])
    h.owner.stop()
  })

  for (const kind of [
    'account',
    'root',
    'readiness',
    'permission',
    'closed',
    'reopened',
    'draft',
    'draft round trip',
    'saved source',
    'proposal',
    'disposed',
  ]) {
    test(`${shape.name} ${kind} invalidation prevents credential-time dispatch`, async () => {
      const h = fixture(shape)
      prepare(h, shape)
      const flight = h.editor.save()
      change(h, shape, kind)
      assert.equal(h.attempts[0].isCurrent(), false)
      if (
        [
          'account',
          'root',
          'readiness',
          'permission',
          'closed',
          'reopened',
          'proposal',
          'disposed',
        ].includes(kind)
      )
        assert.equal(
          h.editor.saving.value,
          false,
          'ending the session releases local busy ownership immediately'
        )
      assert.equal(
        shape.value(h.attempts[0].snapshot),
        'reviewed',
        'submitted fields stay detached'
      )
      h.attempts[0].credentials.resolve()
      await flight
      assert.deepEqual(h.dispatched, [])
      assert.deepEqual(h.successes, [])
      assert.equal(h.editor.error.value, '')
      assert.equal(
        h.editor.saving.value,
        false,
        'obsolete preparation eventually releases its own busy state'
      )
      h.owner.stop()
    })
  }

  for (const kind of ['reopened', 'saved source']) {
    for (const completion of ['success', 'error']) {
      test(`${shape.name} dispatched ${completion} cannot complete a stale ${kind} editor`, async () => {
        const h = fixture(shape)
        prepare(h, shape)
        const flight = h.editor.save()
        h.attempts[0].credentials.resolve()
        await flush()
        assert.equal(h.dispatched.length, 1)
        change(h, shape, kind)
        if (completion === 'success') h.attempts[0].response.resolve()
        else h.attempts[0].response.reject(new Error('Obsolete response'))
        await flight
        assert.equal(
          h.dispatched.length,
          1,
          'a dispatched command is not undone by local cancellation'
        )
        assert.deepEqual(h.successes, [])
        assert.equal(h.open.value, true)
        assert.equal(h.editor.error.value, '')
        assert.equal(
          shape.value(h.editor.draft.value),
          kind === 'reopened' ? 'new session' : 'reviewed'
        )
        h.owner.stop()
      })
    }
  }

  test(`${shape.name} saved-source updates preserve an open dirty draft and invalidate its pending save`, async () => {
    const h = fixture(shape)
    prepare(h, shape)
    const flight = h.editor.save()
    shape.edit(h.source.value, 'external update')
    assert.equal(h.open.value, true)
    assert.equal(shape.value(h.editor.draft.value), 'reviewed')
    assert.equal(h.editor.changed.value, true)
    assert.equal(h.attempts[0].isCurrent(), false)
    h.attempts[0].credentials.resolve()
    await flight
    assert.equal(h.editor.saving.value, false)
    h.editor.begin()
    assert.equal(
      shape.value(h.editor.draft.value),
      'external update',
      'only an explicit new session reloads source'
    )
    assert.equal(h.editor.changed.value, false)
    h.owner.stop()
  })

  for (const kind of ['reopened', 'proposal']) {
    for (const completion of ['success', 'error']) {
      test(`${shape.name} old ${completion} does not release a newer ${kind} save`, async () => {
        const h = fixture(shape)
        prepare(h, shape)
        const first = h.editor.save()
        h.attempts[0].credentials.resolve()
        await flush()
        change(h, shape, kind)
        const newerDraft = structuredClone(toRaw(h.editor.draft.value))
        const second = h.editor.save()
        assert.equal(h.attempts.length, 2)
        assert.equal(h.editor.saving.value, true)
        if (completion === 'success') h.attempts[0].response.resolve()
        else h.attempts[0].response.reject(new Error('Old failure'))
        await first
        assert.equal(h.editor.saving.value, true)
        assert.equal(h.open.value, true)
        assert.deepEqual(h.editor.draft.value, newerDraft)
        assert.equal(h.editor.error.value, '')
        assert.deepEqual(h.successes, [])
        h.attempts[1].credentials.resolve()
        await flush()
        h.attempts[1].response.resolve()
        await second
        assert.equal(h.editor.saving.value, false)
        assert.equal(h.successes.length, 1)
        h.owner.stop()
      })
    }
  }

  test(`${shape.name} failed current save retains the draft and retries with fresh ownership`, async () => {
    const h = fixture(shape)
    prepare(h, shape)
    const first = h.editor.save()
    h.attempts[0].credentials.resolve()
    await flush()
    h.attempts[0].response.reject(new Error('Try this command again.'))
    await first
    assert.equal(h.editor.error.value, 'Try this command again.')
    assert.equal(h.editor.changed.value, true)
    assert.equal(h.editor.saving.value, false)
    assert.equal(h.open.value, true)
    assert.equal(shape.value(h.editor.draft.value), 'reviewed')
    const second = h.editor.save()
    assert.equal(h.editor.error.value, '')
    h.attempts[1].credentials.resolve()
    await flush()
    h.attempts[1].response.resolve()
    await second
    assert.equal(h.successes.length, 1)
    h.owner.stop()
  })

  test(`${shape.name} explicit reset invalidates the old command without closing its modal`, async () => {
    const h = fixture(shape)
    prepare(h, shape)
    const flight = h.editor.save()
    h.editor.reset()
    assert.equal(h.open.value, true)
    assert.equal(h.editor.saving.value, false)
    assert.equal(h.editor.changed.value, false)
    assert.deepEqual(h.editor.draft.value, shape.initial())
    assert.equal(h.attempts[0].isCurrent(), false)
    h.attempts[0].credentials.resolve()
    await flight
    assert.deepEqual(h.dispatched, [])
    h.owner.stop()
  })

  test(`${shape.name} non-Error command failures use the domain error copy`, async () => {
    const h = fixture(shape)
    prepare(h, shape)
    const flight = h.editor.save()
    h.attempts[0].credentials.resolve()
    await flush()
    h.attempts[0].response.reject('Failed command')
    await flight
    assert.equal(h.editor.error.value, 'Identity could not be saved.')
    assert.equal(h.open.value, true)
    h.owner.stop()
  })

  test(`${shape.name} closed or unavailable editors cannot begin or save`, async () => {
    const h = fixture(shape)
    await h.editor.save()
    assert.deepEqual(h.attempts, [])
    h.allowed.value = false
    assert.equal(h.editor.begin(), false)
    assert.equal(h.open.value, false)
    await h.editor.save()
    assert.deepEqual(h.attempts, [])
    h.owner.stop()
  })
}

for (const [field, value] of [
  ['status', 'archived'],
  ['visibility', false],
]) {
  test(`Kitchen ${field} round trip invalidates credential preparation`, async () => {
    const shape = shapes[1]
    const h = fixture(shape)
    prepare(h, shape)
    const flight = h.editor.save()
    const original = h.editor.draft.value[field]
    h.editor.draft.value[field] = value
    h.editor.draft.value[field] = original
    assert.equal(h.attempts[0].isCurrent(), false)
    h.attempts[0].credentials.resolve()
    await flight
    assert.deepEqual(h.dispatched, [])
    assert.equal(h.editor.saving.value, false)
    h.owner.stop()
  })
}
