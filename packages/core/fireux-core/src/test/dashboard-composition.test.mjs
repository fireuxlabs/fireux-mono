import { useDashboardProfiles } from '../runtime/composables/navigation/useDashboardProfiles.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { compile, computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const root = new URL('../runtime/components/Dashboard/', import.meta.url)

async function render(file, values) {
  const source = readFileSync(new URL(file, root), 'utf8')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const script = source
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)?.[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const component = defineComponent({
    props: file.endsWith('Recovery.vue') ? Object.keys(values) : [],
    setup(props) {
      if (file.endsWith('Recovery.vue')) {
        return compileFunction(
          stripTypeScriptTypes(script) + '; return { reload }',
          ['defineProps']
        )(() => props)
      }
      const dependencies = {
        computed,
        useAuth: () => ({ uid: ref('person') }),
        useFireUXConfig: () => ({ appId: 'app', appName: values.appName }),
        useUserRead: () => ({
          user: ref(values.card ?? null),
          outcome: ref(values.userOutcome ?? 'ready'),
          error: ref(null),
        }),
        useUserAccount: () => ({ outcome: ref(values.accountOutcome) }),
        useUserView: () => ({ profile: (value) => value }),
        useAppRead: () => ({ outcome: ref(values.appOutcome) }),
        useAppUserRead: () => ({
          appUser: ref({ role: values.canManageApp ? 'admin' : 'user' }),
          outcome: ref(values.membershipOutcome),
        }),
        useNav: () => ({ desktop: ref(values.profileEntries ?? []) }),
        useDashboardProfiles,
        useWorkspaceEntryCta: () => ({
          hasWorkspaceEntry: ref(values.canOpenWorkspace),
          workspaceEntryHref: ref(values.workspacePath),
          workspaceActions: ref([{ icon: values.workspaceIcon }]),
        }),
      }
      const result = file.endsWith('User.vue')
        ? '{card,accountOutcome,firstName,completionPrompt,coreIsLoading,coreIsError,coreError}'
        : '{fireux,appOutcome,membershipOutcome,appProfileEntries,canOpenWorkspace,workspaceEntryHref,workspaceEntryIcon,canManageApp}'
      return compileFunction(
        stripTypeScriptTypes(script) + '; return ' + result,
        Object.keys(dependencies)
      )(...Object.values(dependencies))
    },
    render: compile(template),
  })
  const app = createSSRApp(
    component,
    file.endsWith('Recovery.vue') ? values : {}
  )
  const container = defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h('section', {}, [
          attrs.title,
          attrs.description,
          slots.default?.(),
          slots.actions?.(),
        ])
    },
  })
  app.component('UPageCard', container)
  app.component('UAlert', container)
  app.component(
    'UButton',
    defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () =>
          h('a', { href: attrs.to }, attrs.label || slots.default?.())
      },
    })
  )
  for (const name of [
    'USeparator',
    'UIcon',
    'UAvatar',
    'FireState',
    'FireDashboardOverviewRecovery',
  ])
    app.component(name, container)
  app.component(
    'FireDiagnosticsDebugPanel',
    defineComponent({
      setup: () => {
        throw new Error('Development diagnostics were activated')
      },
    })
  )
  app.component('DevOnly', defineComponent({ setup: () => () => null }))
  return renderToString(app)
}

const app = {
  appName: 'Example App',
  appOutcome: 'ready',
  membershipOutcome: 'ready',
  profileEntries: [],
  canOpenWorkspace: false,
  workspacePath: '/workspace/kitchen',
  workspaceIcon: 'i-lucide-panels-top-left',
  canManageApp: false,
}

test('the App card describes App availability and only links to Workspace when available', async () => {
  const plain = await render('Overview/App.vue', app)
  assert.match(plain, /Example App/)
  assert.doesNotMatch(
    plain,
    /Open Workspace|\/workspace\/kitchen|Manage Example/
  )
  const available = await render('Overview/App.vue', {
    ...app,
    canOpenWorkspace: true,
    canManageApp: true,
  })
  assert.match(available, /href="\/workspace\/kitchen"/)
  assert.match(available, /Manage Example App/)
  const failed = await render('Overview/App.vue', {
    ...app,
    appOutcome: 'error',
  })
  assert.match(failed, /App details unavailable/)
  assert.doesNotMatch(failed, /Workspace details/)
})

test('missing App membership has an explicit join action back to Dashboard', async () => {
  const html = await render('Overview/App.vue', {
    ...app,
    membershipOutcome: 'empty',
  })
  assert.match(html, /Join this App/)
  assert.match(html, /href="\/users\/create\?redirect=%2Fdashboard"/)
  assert.doesNotMatch(html, /has not granted/)
})

test('User presentation and private-account recovery remain separate', async () => {
  const html = await render('Overview/User.vue', {
    card: {
      displayName: 'Example Person',
      handle: 'example',
      avatarUrl: '',
      to: '/users/example',
    },
    accountOutcome: 'error',
  })
  assert.match(html, /Example Person/)
  assert.match(html, /Account settings unavailable/)
  assert.match(html, /href="\/dashboard\/settings"/)
})

test('identity recovery keeps Dashboard return links and excludes development diagnostics from production rendering', async () => {
  const empty = await render('Overview/Recovery.vue', {
    outcome: 'empty',
    error: null,
  })
  assert.match(empty, /Set up your profile/)
  assert.match(empty, /href="\/users\/create\?redirect=%2Fdashboard"/)
  const failed = await render('Overview/Recovery.vue', {
    outcome: 'error',
    error: new Error('private diagnostic'),
  })
  assert.match(failed, /Your sign-in works/)
  assert.match(failed, /href="\/auth\?redirect=%2Fdashboard"/)
  assert.doesNotMatch(failed, /private diagnostic/)
})
