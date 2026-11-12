import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { compile, computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

async function render(file, homePath) {
  const source = readFileSync(
    new URL(`../runtime/app/components/${file}`, import.meta.url),
    'utf8'
  )
  const script = source
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const snapshot = { id: 'tenant-app', name: 'Tenant App' }
  const dependencies = {
    computed,
    useFireUXConfig: () => ({
      appId: snapshot.id,
      appName: snapshot.name,
      homePath,
      domains: [],
    }),
    useAppRead: () => ({
      app: ref(snapshot),
      outcome: ref('ready'),
      pending: ref(false),
      error: ref(null),
    }),
    useRouter: () => ({ getRoutes: () => [] }),
    useAppView: () => ({
      toCard: (app) => ({ ...app, to: '/apps/tenant-app', badges: [] }),
    }),
  }
  const fields = file.startsWith('Dashboard')
    ? '{fireux,appOutcome,appSnapshot,appDisplayName,adminToolGroups}'
    : '{homePath,appPending,appError,appCard}'
  const component = defineComponent({
    setup: () =>
      compileFunction(
        `${stripTypeScriptTypes(script)}; return ${fields}`,
        Object.keys(dependencies)
      )(...Object.values(dependencies)),
    render: compile(template),
  })
  const app = createSSRApp(component)
  const container = {
    setup:
      (_, { slots }) =>
      () =>
        h('section', [slots.default?.(), slots.links?.()]),
  }
  for (const name of ['UPageHeader', 'UPageCard'])
    app.component(name, container)
  const link = {
    props: ['to', 'label', 'name'],
    setup: (props) => () =>
      h('a', { href: props.to }, props.label || props.name),
  }
  app.component('UButton', link)
  app.component('AppCardsCell', link)
  app.component('AppEditAdmin', { render: () => null })
  app.component('UAlert', { render: () => null })
  app.component('FireState', { render: () => null })
  app.component('UIcon', { render: () => null })
  return renderToString(app)
}

for (const file of ['Dashboard/Admin.vue', 'Membership/CurrentApp.vue']) {
  test(`${file} opens the configured App home without a Main App catalogue route`, async () => {
    for (const homePath of ['/', '/welcome']) {
      const html = await render(file, homePath)
      assert.ok(html.includes(`href="${homePath}"`))
      assert.doesNotMatch(html, /href="\/apps\//)
    }
  })
}
