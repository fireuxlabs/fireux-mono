import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, reactive } from 'vue'

function compile(source, name, dependencies) {
  const code = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)};return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const useCollectionSearch = compile(
  readFileSync(
    new URL(
      '../runtime/composables/shared/useCollectionSearch.ts',
      import.meta.url
    ),
    'utf8'
  ),
  'useCollectionSearch',
  { computed, ref }
)
function collection(apps) {
  const props = reactive({ apps, hasMore: true })
  const projections = []
  const source = readFileSync(
    new URL('../runtime/app/components/Collection/Index.vue', import.meta.url),
    'utf8'
  ).match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  const state = compile(source, '({ query, cardsFiltered, countLabel })', {
    computed,
    useCollectionSearch,
    defineProps: () => props,
    useAppView: () => ({
      toCard: (app) => {
        projections.push(app.id)
        return {
          id: app.id,
          displayName: app.name,
          imageUrl: app.media?.logo_url,
        }
      },
    }),
  })
  return { state, props, projections }
}
test('App discovery searches declared copy, excludes URLs/internal facts, and projects each match once', () => {
  const apps = Array.from({ length: 1000 }, (_, i) => ({
    id: `private-record-${i}`,
    name: `Studio ${i}`,
    short_name: `S${i}`,
    tagline: i % 2 ? 'Restaurant tools' : 'Property tools',
    description: `Description ${i}`,
    ecosystem_id: `ecosystem-${i % 10}`,
    context: 'privateoperatorsecret',
    status: 'archived',
    role: 'tenant',
    media: { logo_url: 'https://hiddenassetkeyword.test/logo.png' },
  }))
  const h = collection(apps)
  for (const query of [
    '',
    '  RESTAURANT  ',
    'property',
    'S42',
    'Description 19',
    'ecosystem-4',
    'hiddenassetkeyword',
    'privateoperatorsecret',
    'private-record',
    'archived',
  ]) {
    h.projections.length = 0
    h.state.query.value = query
    const term = query.trim().toLowerCase()
    const expected = apps.filter(
      (app) =>
        !term ||
        [
          app.name,
          app.short_name,
          app.tagline,
          app.description,
          app.ecosystem_id,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term)
    )
    assert.deepEqual(
      h.state.cardsFiltered.value.map((card) => card.id),
      expected.map((app) => app.id)
    )
    assert.equal(h.projections.length, expected.length)
    assert.equal(new Set(h.projections).size, expected.length)
    assert.match(h.state.countLabel.value, /loaded$/)
  }
  h.state.query.value = 'Studio 999'
  assert.equal(h.state.cardsFiltered.value.length, 1)
  h.props.apps = apps.filter((app) => app.id !== 'private-record-999')
  assert.equal(h.state.cardsFiltered.value.length, 0)
  h.props.hasMore = false
  assert.doesNotMatch(h.state.countLabel.value, /loaded$/)
})
