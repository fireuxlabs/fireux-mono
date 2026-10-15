import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { createRequire } from 'node:module'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse, compileScript } from 'vue/compiler-sfc'
import { transpileModule, ModuleKind } from 'typescript'
const require = createRequire(import.meta.url)
function component(name) {
  const file = new URL(
    `../runtime/supplier/components/Catalogue/Detail/${name}.vue`,
    import.meta.url
  )
  const { descriptor, errors } = parse(readFileSync(file, 'utf8'), {
    filename: file.pathname,
  })
  assert.deepEqual(errors, [])
  const compiled = compileScript(descriptor, { id: name, inlineTemplate: true })
  const code = transpileModule(compiled.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const module = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    require,
    module,
    module.exports
  )
  return module.exports.default
}
const Detail = component('Index'),
  Section = component('Section')
async function render(showHeader = true) {
  const app = createSSRApp(Detail, {
    id: 'catalogue',
    title: 'Fresh stock',
    active: false,
    showHeader,
    sections: [
      {
        id: 'produce',
        label: 'Produce',
        description: 'Seasonal offers',
        imageUrl: '',
        options: [
          {
            id: 'offer',
            label: 'Carrots',
            packLabel: 'Carrots · 5 kg',
            packPriceLabel: 'CHF 12',
            unitPriceLabel: 'CHF 2.40',
            unit: 'kg',
            active: false,
            badges: ['Organic'],
          },
        ],
      },
    ],
  })
  app.component('SupplierCatalogueDetailSection', Section)
  app.component('UBadge', {
    props: ['label'],
    setup:
      (props, { slots }) =>
      () =>
        h('span', props.label || slots.default?.()),
  })
  app.component('UAvatar', { setup: () => () => h('img') })
  return renderToString(app)
}
test('Catalogue detail preserves grouped Supplier offer terms and states', async () => {
  const html = await render()
  for (const text of [
    'Fresh stock',
    'Produce',
    'Seasonal offers',
    'Carrots · 5 kg',
    'CHF 12',
    'CHF 2.40',
    'Organic',
    'Inactive',
  ])
    assert.ok(html.includes(text), text)
})
test('Catalogue header can be hidden while section and offer content remain', async () => {
  const html = await render(false)
  assert.doesNotMatch(html, /Fresh stock/)
  assert.match(html, /Produce/)
  assert.match(html, /Carrots · 5 kg/)
})
