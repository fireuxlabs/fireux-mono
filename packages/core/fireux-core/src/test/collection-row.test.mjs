import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
const source = readFileSync(
  new URL('../runtime/components/Collection/Row.vue', import.meta.url),
  'utf8'
)
const template = source.slice(
  source.indexOf('<template>') + 10,
  source.lastIndexOf('</template>')
)
const Row = { props: { as: { default: 'article' } }, render: compile(template) }
test('plain collection row keeps editable content and action controls as separate slots', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          Row,
          { as: 'li' },
          {
            default: () => h('label', 'Section name'),
            actions: () =>
              h('button', { 'aria-label': 'Actions for section' }, 'Actions'),
          }
        ),
    })
  )
  assert.ok(html.startsWith('<li'))
  assert.ok(html.includes('Section name'))
  assert.ok(html.includes('aria-label="Actions for section"'))
  assert.ok(!html.includes('collection-row__value'))
})
test('priced row renders caller-owned value without adding card or navigation semantics', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          Row,
          {},
          { default: () => h('h3', 'Dish'), value: () => h('span', '13.00') }
        ),
    })
  )
  assert.ok(html.startsWith('<article'))
  assert.ok(html.includes('13.00'))
  assert.ok(!html.includes('collection-row__actions'))
  assert.ok(!/<a(?:\s|>)/.test(html))
})
