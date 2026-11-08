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
  const filename = new URL(`user/components/Agent/Cards/${name}.vue`, runtime)
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

test('Agent Preview preserves supplied identity, summary override and action forwarding', async () => {
  let activate
  let actions = 0
  const app = Vue.createSSRApp(card('Preview'), {
    to: '/agents/alex',
    avatarUrl: '',
    displayName: 'Alex Recruiter',
    handle: 'alex',
    title: 'Hospitality recruitment',
    badges: ['Available'],
    summary: 'Original summary',
    prop: 'Preview summary',
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
  assert.match(html, /href="\/agents\/alex"/)
  for (const text of [
    'Alex Recruiter',
    'Hospitality recruitment',
    'Preview summary',
    'Available',
  ])
    assert.ok(html.includes(text), text)
  assert.doesNotMatch(html, /Original summary/)
  activate()
  assert.equal(actions, 1)
})

test('Agent Overview preserves hiring focus, coverage, contact links and supplied actions', async () => {
  const Overview = card('Overview')
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(
        Overview,
        {
          card: {
            displayName: 'Alex Recruiter',
            summary: 'Hiring hospitality teams',
            badges: ['Trusted'],
            contactEmail: 'hiring@example.test',
            contactPhone: '+410123',
            websiteUrl: 'https://example.test',
          },
          profile: {
            agent_bio: 'A separate biography',
            agent_placement_types: [' Permanent ', '', 'Contract'],
            tags: ['Permanent', 'Hospitality'],
            agent_coverage_areas: [' Bern ', ''],
          },
        },
        { actions: () => Vue.h('button', 'Manage profile') }
      ),
  })
  app.component('UserProfileHero', {
    props: ['displayName', 'summary', 'labels', 'stats'],
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
        Vue.h('section', [Vue.h('h2', props.title), slots.default?.()]),
  })
  for (const name of ['UPageGrid', 'UCard'])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          Vue.h('div', slots.default?.()),
    })
  app.component('UIcon', { render: () => null })
  app.component('UBadge', {
    props: ['label'],
    setup: (props) => () => Vue.h('span', props.label),
  })
  app.component('UButton', {
    props: ['to', 'target', 'rel', 'label'],
    setup: (props) => () =>
      Vue.h(
        'a',
        {
          href: props.to,
          target: props.target,
          rel: props.rel,
        },
        props.label
      ),
  })
  const html = await renderToString(app)
  for (const text of [
    'Alex Recruiter',
    'Hiring hospitality teams',
    'A separate biography',
    'Placement focus',
    'Permanent',
    'Contract',
    'Hospitality',
    'Bern',
    'Manage profile',
  ])
    assert.ok(html.includes(text), text)
  assert.equal(html.match(/Permanent/g).length, 1)
  assert.match(html, /href="mailto:hiring@example.test"/)
  assert.match(html, /href="tel:\+410123"/)
  assert.match(
    html,
    /href="https:\/\/example.test" target="_blank" rel="noreferrer"/
  )
})
