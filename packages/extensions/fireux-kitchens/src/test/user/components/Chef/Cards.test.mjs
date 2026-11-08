import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileScript, parse } from 'vue/compiler-sfc'
import ts from 'typescript'

const runtime = new URL('../../../../runtime/', import.meta.url)
function card(name) {
  const filename = new URL(`user/components/Chef/Cards/${name}.vue`, runtime)
    .pathname
  const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
  const script = compileScript(descriptor, {
    id: filename,
    inlineTemplate: true,
  })
  const code = ts.transpileModule(script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports'])((id) => {
    assert.equal(id, 'vue')
    return Vue
  }, exports)
  return exports.default
}

test('Chef Preview preserves supplied content, specialty badges and action forwarding', async () => {
  let activate
  let actions = 0
  const app = Vue.createSSRApp(card('Preview'), {
    displayName: 'Alex Chef',
    title: 'Head chef',
    summary: 'Seasonal cooking',
    badges: ['Available'],
    specialtiesCsv: ' Grill, , Pastry ',
    to: '/chefs/alex',
    link: true,
    onAction: () => actions++,
  })
  app.component('UserProfileDirectoryCard', {
    props: ['displayName', 'headline', 'summary', 'badges', 'to', 'link'],
    emits: ['action'],
    setup(props, { emit }) {
      activate = () => emit('action')
      return () =>
        Vue.h('a', { href: props.link ? props.to : undefined }, [
          props.displayName,
          props.headline,
          props.summary,
          props.badges.join('|'),
        ])
    },
  })
  const html = await renderToString(app)
  assert.match(html, /href="\/chefs\/alex"/)
  for (const text of [
    'Alex Chef',
    'Head chef',
    'Seasonal cooking',
    'Available|Grill|Pastry',
  ])
    assert.ok(html.includes(text), text)
  activate()
  assert.equal(actions, 1)
})

test('Chef Overview preserves culinary sections, gallery and the supplied actions slot', async () => {
  const Overview = card('Overview')
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(
        Overview,
        {
          card: { displayName: 'Alex Chef', summary: 'Seasonal cooking' },
          profile: {
            chef_bio: 'A separate biography',
            chef_signature_dishes: [' Grill ', '', 'Pastry'],
            chef_gallery: [{ name: 'Signature dish', image_url: '/dish.jpg' }],
            chef_organization_name: 'Example Kitchen',
          },
        },
        { actions: () => Vue.h('button', 'Manage profile') }
      ),
  })
  app.component('UserProfileHero', {
    props: ['displayName', 'summary'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('header', [props.displayName, props.summary, slots.actions?.()]),
  })
  app.component('UserProfileSection', {
    props: ['title'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('section', [
          Vue.h('h2', props.title),
          slots.meta?.(),
          slots.default?.(),
        ]),
  })
  app.component('UBadge', {
    props: ['label'],
    setup: (props) => () => Vue.h('span', props.label),
  })
  const html = await renderToString(app)
  for (const text of [
    'Alex Chef',
    'Seasonal cooking',
    'A separate biography',
    'Selected dishes',
    'Signature dishes',
    'Grill',
    'Pastry',
    'Example Kitchen',
    'Manage profile',
  ])
    assert.ok(html.includes(text), text)
  assert.match(
    html,
    /<img[^>]*src="\/dish.jpg"[^>]*alt="Signature dish"[^>]*loading="lazy"/
  )
})
