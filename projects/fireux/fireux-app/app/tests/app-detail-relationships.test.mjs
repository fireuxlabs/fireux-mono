import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  compile,
  computed,
  createSSRApp,
  defineComponent,
  h,
  ref,
  toValue,
} from 'vue'
import { renderToString } from 'vue/server-renderer'

const root = new URL('../../../../../', import.meta.url)
function component(path, props, fields, dependencies = {}) {
  const source = readFileSync(new URL(path, root), 'utf8')
  const script = source
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  return defineComponent({
    props,
    setup(props) {
      const inputs = { computed, defineProps: () => props, ...dependencies }
      return compileFunction(
        `${stripTypeScriptTypes(script)}; return ${fields}`,
        Object.keys(inputs)
      )(...Object.values(inputs))
    },
    render: compile(
      source.slice(
        source.indexOf('<template>') + 10,
        source.lastIndexOf('</template>')
      )
    ),
  })
}

const path = 'projects/fireux/fireux-app/app/components/'
const ecosystem = {
  id: 'own-eco',
  project_id: 'own-project',
  status: 'active',
  name: 'Own Ecosystem',
  description: 'Ecosystem description',
}
const project = {
  id: 'own-project',
  identity: {
    status: 'active',
    name: 'Own Project',
    description: 'Project description',
  },
}

async function render({
  ecosystemOutcome = 'ready',
  projectOutcome = 'ready',
  projectStatus = 'active',
} = {}) {
  const reads = []
  const parent = component(
    path + 'App/Detail/Index.vue',
    ['app'],
    '{ecosystem,ecosystemOutcome,ecosystemError}',
    {
      useSeo: () => {},
      isDirectoryAppIndexable: () => true,
      useEcosystemDetail: (id) => {
        reads.push(['ecosystem', toValue(id)])
        return {
          ecosystem: ref(ecosystemOutcome === 'ready' ? ecosystem : null),
          outcome: ref(ecosystemOutcome),
          error: ref(null),
        }
      },
      usePlatformDirectory: () =>
        assert.fail(
          'A detail relation must not acquire the platform directory'
        ),
    }
  )
  const app = createSSRApp(parent, {
    app: { id: 'own-app', name: 'Own App', ecosystem_id: ecosystem.id },
  })
  app.component(
    'EcosystemCardsPreview',
    component(
      'packages/core/fireux-core/src/runtime/ecosystem/components/Cards/Preview.vue',
      ['ecosystem'],
      '{}'
    )
  )
  app.component(
    'EcosystemDetailProject',
    component(
      path + 'Ecosystem/Detail/Project.vue',
      ['ecosystem'],
      '{project,publicProject,publicOutcome,error}',
      {
        useProjectDetail: (id) => {
          reads.push(['project', toValue(id)])
          return {
            project: ref(
              projectOutcome === 'ready'
                ? {
                    ...project,
                    identity: { ...project.identity, status: projectStatus },
                  }
                : null
            ),
            outcome: ref(projectOutcome),
            error: ref(null),
          }
        },
        useProjects: () =>
          assert.fail('A relation must not acquire all Projects'),
      }
    )
  )
  app.component(
    'ProjectCardsPreview',
    component(
      'packages/extensions/fireux-projects/src/runtime/project/components/Cards/Preview.vue',
      ['project'],
      '{}'
    )
  )
  app.component(
    'FireState',
    component(
      'packages/core/fireux-core/src/runtime/components/molecules/State.vue',
      ['outcome', 'entity', 'error', 'retryable'],
      '{message}',
      {
        withDefaults: (props) => props,
        defineEmits: () => {},
      }
    )
  )
  app.component('UCard', {
    setup:
      (_, { slots }) =>
      () =>
        h('section', [slots.header?.(), slots.default?.()]),
  })
  app.component('ULink', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  })
  for (const name of [
    'AppDetailHeader',
    'FireDiagnosticsDebugPanel',
    'UIcon',
    'FireCopyError',
    'UButton',
  ])
    app.component(name, { render: () => null })
  return { html: await renderToString(app), reads }
}

test('App detail acquires one exact Ecosystem and its exact Project without directory counts', async () => {
  const { html, reads } = await render()
  assert.deepEqual(reads, [
    ['ecosystem', 'own-eco'],
    ['project', 'own-project'],
  ])
  assert.match(html, /href="\/ecosystems\/own-eco"/)
  assert.match(html, /Own Ecosystem/)
  assert.match(html, /Ecosystem description/)
  assert.match(html, /href="\/projects\/own-project"/)
  assert.match(html, /Own Project/)
  assert.match(html, /Project description/)
})

test('Unavailable Ecosystem relations display their state without starting a Project read', async () => {
  for (const [outcome, message] of [
    ['pending', 'Loading published Ecosystem'],
    ['error', 'Unable to load published Ecosystem'],
    ['empty', 'No published Ecosystem yet'],
  ]) {
    const { html, reads } = await render({ ecosystemOutcome: outcome })
    assert.match(html, new RegExp(message))
    assert.deepEqual(reads, [['ecosystem', 'own-eco']])
    assert.doesNotMatch(html, /href="\/projects\//)
  }
})

test('Exact Project reads preserve public active-only policy and truthful failure outcomes', async () => {
  for (const status of ['inactive', 'archived']) {
    const { html } = await render({ projectStatus: status })
    assert.match(html, /No published Project yet/)
    assert.doesNotMatch(html, /Own Project|href="\/projects\//)
    assert.match(html, /Own Ecosystem/)
  }
  for (const [outcome, message] of [
    ['pending', 'Loading published Project'],
    ['error', 'Unable to load published Project'],
    ['empty', 'No published Project yet'],
  ]) {
    const { html } = await render({ projectOutcome: outcome })
    assert.match(html, new RegExp(message))
    assert.match(html, /Own Ecosystem/)
  }
})
