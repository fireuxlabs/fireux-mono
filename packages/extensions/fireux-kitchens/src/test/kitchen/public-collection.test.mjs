import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, reactive, ref, toRefs, compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useCollectionSearch } from '../../../../../core/fireux-core/src/runtime/composables/shared/useCollectionSearch.ts'
import { useCollectionPage } from '../../../../../core/fireux-core/src/runtime/composables/shared/useCollectionPage.ts'

const runtime = new URL('../../runtime/', import.meta.url)
const read = (path) => readFileSync(new URL(path, runtime), 'utf8')
const evaluate = (source, bindings, result) =>
  compileFunction(
    stripTypeScriptTypes(
      source
        .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
        .replace(/^export /gm, '')
    ) + `;return ${result}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
const script = (source) =>
  source.split('<script setup lang="ts">')[1].split('</script>')[0]

test('Kitchen collection projects once and filters only useful discovery facts', () => {
  let projections = 0
  const kitchen = (name, category, address) => ({
    name,
    shortName: '',
    formattedAddress: address,
    tagline: '',
    about: '',
    categoryLabels: [category],
    serviceLabels: ['Delivery'],
    discoveryImageUrl: '/private-image-token.jpg',
  })
  const props = reactive({
    kitchens: [
      kitchen('La Tapberne', 'tapas', 'Bern'),
      kitchen('Luna', 'italian', 'Wilderswil'),
    ],
  })
  const collection = evaluate(
    script(read('kitchen/components/Collection/Index.vue')),
    {
      computed,
      ref,
      useCollectionSearch,
      defineProps: () => props,
      useKitchenInterface: () => ({
        surface: ({ kitchen }) => kitchen,
        interface: (value) => {
          projections++
          return value
        },
      }),
    },
    '{ query, selectedCategory, categoryFilters, cardsFiltered, countLabel }'
  )
  assert.equal(collection.cardsFiltered.value.length, 2)
  assert.equal(collection.countLabel.value, '2 kitchens')
  assert.deepEqual(
    collection.categoryFilters.value.map((x) => x.label),
    ['All Kitchens', 'Italian', 'Tapas']
  )
  assert.equal(projections, 2)

  collection.query.value = 'BERN'
  assert.equal(collection.cardsFiltered.value[0].name, 'La Tapberne')
  assert.equal(collection.countLabel.value, '1 of 2 kitchens')
  collection.selectedCategory.value = 'italian'
  assert.equal(collection.cardsFiltered.value.length, 0)
  collection.query.value = 'delivery'
  assert.equal(collection.cardsFiltered.value[0].name, 'Luna')
  collection.query.value = 'private-image-token'
  assert.equal(collection.cardsFiltered.value.length, 0)
  collection.query.value = ''
  assert.equal(collection.countLabel.value, '1 kitchen')
  assert.equal(projections, 2)

  props.kitchens = [kitchen('Fresh Kitchen', 'italian', 'Bern')]
  assert.equal(collection.cardsFiltered.value[0].name, 'Fresh Kitchen')
  assert.equal(projections, 3)
})

test('Kitchen index retry reaches its one reader without creating another acquisition', async () => {
  let reads = 0
  let refreshes = 0
  const useKitchenCollectionPage = evaluate(
    read('kitchen/composables/useKitchenCollectionPage.ts'),
    {
      reactive,
      toRefs,
      useCollectionPage,
      useFireUXConfig: () => ({ appName: 'Misebox' }),
      useSeo: () => {},
      useKitchens: () => {
        reads++
        return {
          collection: ref([]),
          outcome: ref('error'),
          error: ref(new Error('Offline')),
          refresh: () => {
            refreshes++
          },
        }
      },
    },
    'useKitchenCollectionPage'
  )
  const source = read('pages/kitchens/index.vue')
  const page = evaluate(
    script(source),
    { useKitchenCollectionPage, definePageMeta: () => {} },
    'page'
  )
  const app = createSSRApp({
    setup: () => ({ page }),
    render: compile(source.slice(10, source.lastIndexOf('</template>'))),
  })
  let retry
  for (const name of ['UPage', 'UPageBody'])
    app.component(name, {
      setup: (_, ctx) => () => h('div', ctx.slots.default?.()),
    })
  for (const name of [
    'PublicKitchenHero',
    'PublicKitchenDirectoryCreate',
    'PublicKitchenCollection',
    'FireDiagnosticsDebugPanel',
  ])
    app.component(name, { render: () => null })
  app.component('FireState', {
    props: { outcome: String, retryable: Boolean },
    setup: (props, ctx) => {
      retry = ctx.attrs.onRetry
      return () =>
        h('div', {
          'data-state': props.outcome,
          'data-retryable': props.retryable,
        })
    },
  })
  const html = await renderToString(app)
  assert.match(html, /data-state="error"/)
  assert.match(html, /data-retryable="true"/)
  retry()
  assert.equal(refreshes, 1)
  assert.equal(reads, 1)
})
