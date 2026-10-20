import test from 'node:test'
import assert from 'node:assert/strict'
import { loadOfferingSource } from './offering-test-helpers.mjs'
const { kitchenAIInstruction } = loadOfferingSource('kitchen/server/ai/role', 'kitchenAIInstruction', {
  operatorContextInstruction: 'Saved context is background, not approval.',
})
const failure = (value) => Object.assign(new Error(value.statusMessage), value)
function harness({
  denied = false,
  result = {
    ok: true,
    data: { message: 'Choose a published Menu in Services.' },
  },
} = {}) {
  const authorized = [],
    generated = []
  const { answerFoodOverview } = loadOfferingSource(
    'kitchen/server/food/answer',
    'answerFoodOverview',
    {
      createError: failure,
      useFireUXConfig: () => ({ appId: 'app' }),
      readAuthorizedOperatorContext: async (...input) => {
        authorized.push(input)
        if (denied) throw Error('Denied')
        return {
          kitchen: 'Owner background',
          venue: 'Breakfast hours need owner confirmation.',
          menus: [],
        }
      },
      kitchenAIInstruction,
      useFireuxAi: () => ({
        generateJson: async (input) => {
          generated.push(input)
          return result
        },
      }),
    }
  )
  return { answerFoodOverview, authorized, generated }
}
const overview = {
  services: [{ name: 'Collection', label: 'Needs setup' }],
  menus: [{ id: 'food', name: 'Food', status: 'draft' }],
}
test('Food AI checks existing Kitchen context authority before generation', async () => {
  const h = harness({ denied: true })
  await assert.rejects(
    h.answerFoodOverview(
      {},
      { kitchenId: 'k', prompt: 'What needs setup?', overview }
    ),
    /Denied/
  )
  assert.deepEqual(h.generated, [])
})
test('Food AI reuses page facts and authorized saved context without an independent catalogue reader', async () => {
  const h = harness()
  const result = await h.answerFoodOverview(
    {},
    { kitchenId: 'k', prompt: 'What needs setup?', overview }
  )
  assert.match(result.message, /published Menu/)
  assert.deepEqual(h.authorized[0], [{}, 'k', ['food']])
  const context = h.generated[0].context
  assert.ok(context.instruction.startsWith(kitchenAIInstruction))
  assert.match(context.instruction, /local focus within its wider setup/)
  assert.match(context.instruction, /does not mean you have read its other pages/)
  assert.equal(context.focus, 'Food & drink overview')
  assert.deepEqual(context.page, overview)
  assert.match(context.operatorContext.venue, /owner confirmation/)
  assert.deepEqual(context.availableActions, [])
  assert.equal(
    h.generated[0].outputJsonSchema.properties.message.maxLength,
    600
  )
})
test('invalid requests and oversized replies fail clearly', async () => {
  const h = harness()
  for (const input of [
    { kitchenId: 'k', prompt: ' ', overview },
    { kitchenId: 'k', prompt: 'Help', overview: 'x'.repeat(16001) },
    { kitchenId: 'k', prompt: 'Help', overview: [] },
    { kitchenId: 'k', prompt: 'Help', overview: { text: 'x'.repeat(16001) } },
  ])
    await assert.rejects(h.answerFoodOverview({}, input), /short question/)
  assert.equal(h.authorized.length, 0)
  for (const message of ['', 'x'.repeat(601)]) {
    const invalid = harness({ result: { ok: true, data: { message } } })
    await assert.rejects(
      invalid.answerFoodOverview(
        {},
        { kitchenId: 'k', prompt: 'Help', overview }
      ),
      /could not answer/
    )
  }
})

import { computed, effectScope, ref, watch, toValue } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
test('an AI reply for the previous Kitchen cannot replace the current overview', async () => {
  const kitchenId = ref('k'),
    ready = ref(true),
    overview = ref({ services: [] })
  const response = deferred(),
    dispatched = deferred()
  const scope = effectScope()
  const { useFoodOverviewAI } = loadOfferingSource(
    'kitchen/composables/workspace/food/useFoodOverviewAI',
    'useFoodOverviewAI',
    {
      ref,
      watch,
      toValue,
      useCommandScope,
      useRoute: () => ({ fullPath: '/workspace/kitchen/food-and-drink' }),
      useAuth: () => ({ currentUser: ref({ uid: 'u' }) }),
      useUserSession: () => ({ appUser: ref({ id: 'u' }) }),
      useFireUXConfig: () => ({ appId: 'app' }),
      useRequireUser: async () => ({
        uid: 'u',
        getIdToken: async () => 'token',
      }),
      $fetch: async () => {
        dispatched.resolve()
        return response.promise
      },
    }
  )
  const ai = scope.run(() => useFoodOverviewAI({ kitchenId, ready, overview }))
  ai.prompt.value = 'What needs setup?'
  const pending = ai.ask()
  await dispatched.promise
  kitchenId.value = 'other'
  response.resolve({ message: 'Old Kitchen answer' })
  await pending
  assert.equal(ai.message.value, '')
  assert.equal(ai.submitting.value, false)
  scope.stop()
})

test('the overview publishes the same current facts used by its AI and clears them on disposal', async () => {
  const { readFileSync } = await import('node:fs')
  const { compileFunction } = await import('node:vm')
  const { stripTypeScriptTypes } = await import('node:module')
  const { onScopeDispose, watchEffect } = await import('vue')
  const outcome = ref('ready'),
    menusOutcome = ref('ready'),
    placeOutcome = ref('ready')
  const menus = ref([{ id: 'food', name: 'Food', status: 'published' }])
  const page = {
    state: null,
    publish(value) {
      this.state = value
    },
  }
  let acquisitions = 0
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Food/Index.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const deps = {
    computed,
    watchEffect,
    onScopeDispose,
    useWorkspacePageState: () => page,
    useFoodCatalogueSummary: () => ref({}),
    useKitchenOfferings: () => {
      acquisitions++
      return {
        kitchenId: ref('k'),
        offerings: ref([]),
        menus,
        outcome,
        menusOutcome,
        placeOutcome,
        kitchenHours: ref({}),
        canWrite: ref(true),
      }
    },
    useKitchenOfferingNow: () => ({ now: ref(new Date()) }),
    resolveServiceHours: (value) => value,
    foodServiceSummary: () => [{ name: 'Collection', label: 'Needs setup' }],
    serviceOverviewSnapshot: () => ({
      services: [{ type: 'collection', status: 'Enabled' }],
    }),
  }
  const scope = effectScope()
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return {overview, ready}`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  assert.equal(acquisitions, 1)
  assert.equal(page.state.overview, state.overview.value)
  assert.deepEqual(page.state.overview.availableActions, [])
  assert.equal(page.state.overview.menus[0].id, 'food')
  menusOutcome.value = 'error'
  await Promise.resolve()
  assert.equal(state.ready.value, false)
  assert.deepEqual(page.state.overview.menus, [])
  assert.deepEqual(page.state.overview.setup, [])
  scope.stop()
  assert.deepEqual(page.state, { derived: { outcome: 'idle' } })
})
