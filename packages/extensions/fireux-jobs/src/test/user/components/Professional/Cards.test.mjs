import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileScript, parse } from 'vue/compiler-sfc'
import ts from 'typescript'
import { useProfessionalProfilePresentation } from '../../../../runtime/user/composables/profiles/Professional/utils/view/useProfessionalProfilePresentation.ts'

const runtime = new URL('../../../../runtime/', import.meta.url)
function card(name) {
  const filename = new URL(
    `user/components/Professional/Cards/${name}.vue`,
    runtime
  ).pathname
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
    if (id === 'vue') return Vue
    assert.equal(
      id,
      '../../../composables/profiles/Professional/utils/view/useProfessionalProfilePresentation'
    )
    return { useProfessionalProfilePresentation }
  }, exports)
  return exports.default
}

test('Professional Preview preserves its preferred image, supplied content and action forwarding', async () => {
  let activate
  let actions = 0
  const app = Vue.createSSRApp(card('Preview'), {
    to: '/professionals/alex',
    avatarUrl: '/fallback.jpg',
    image: '/portrait.jpg',
    displayName: 'Alex Professional',
    handle: 'alex',
    title: 'Head chef',
    badges: ['Available'],
    summary: 'Hospitality experience',
    link: true,
    onAction: () => actions++,
  })
  app.component('UserProfileDirectoryCard', {
    props: ['displayName', 'avatarUrl', 'headline', 'summary', 'to', 'link'],
    emits: ['action'],
    setup(props, { emit }) {
      activate = () => emit('action')
      return () =>
        Vue.h('a', { href: props.link ? props.to : undefined }, [
          Vue.h('img', { src: props.avatarUrl, alt: props.displayName }),
          props.displayName,
          props.headline,
          props.summary,
        ])
    },
  })
  const html = await renderToString(app)
  assert.match(html, /href="\/professionals\/alex"/)
  assert.match(html, /src="\/portrait.jpg"/)
  for (const text of [
    'Alex Professional',
    'Head chef',
    'Hospitality experience',
  ])
    assert.ok(html.includes(text), text)
  activate()
  assert.equal(actions, 1)
})

test('Professional Overview preserves portfolio sections, evidence and supplied actions', async () => {
  const Overview = card('Overview')
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(
        Overview,
        {
          card: {
            displayName: 'Alex Professional',
            image: '/portrait.jpg',
            badges: ['Available'],
          },
          profile: {
            summary: 'Portfolio summary',
            bio: 'Professional biography',
            projects: [
              {
                name: 'New kitchen launch',
                role: 'Lead',
                ongoing: true,
                from_year: '2024',
                responsibilities: 'Opened a restaurant',
              },
            ],
            relevant_experience: [
              {
                place_id: 'place-one',
                role: 'Head chef',
                ongoing: true,
                from_year: '2024',
                from_month: 'Jan',
                responsibilities: 'Built the team',
              },
            ],
            languages: [{ language: 'English', proficiency: 'native' }],
          },
        },
        { actions: () => Vue.h('button', 'Share profile') }
      ),
  })
  app.component('UserProfileHero', {
    props: ['avatarUrl', 'displayName', 'summary', 'labels', 'stats'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('header', [
          props.displayName,
          props.summary,
          slots.media?.({
            imageUrl: props.avatarUrl,
            displayName: props.displayName,
            icon: 'user',
          }),
          slots.badges?.(),
          slots.actions?.(),
        ]),
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
  app.component('ProfessionalProfileEvidence', {
    props: ['model'],
    setup: (props) => () =>
      Vue.h(
        'aside',
        props.model.languages.map((entry) => entry.language)
      ),
  })
  app.component('ULink', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('a', { href: props.to }, slots.default?.()),
  })
  app.component('UBadge', {
    props: ['label'],
    setup: (props) => () => Vue.h('span', props.label),
  })
  app.component('UIcon', { render: () => null })
  app.component('PlaceCardsPill', { render: () => null })
  const html = await renderToString(app)
  for (const text of [
    'Alex Professional',
    'Portfolio summary',
    'Professional biography',
    'New kitchen launch',
    'Opened a restaurant',
    'Current chapter',
    'Head chef',
    'Built the team',
    'English',
    'Share profile',
  ])
    assert.ok(html.includes(text), text)
  assert.match(
    html,
    /src="\/portrait.jpg"[^>]*loading="eager"[^>]*fetchpriority="high"/
  )
})
