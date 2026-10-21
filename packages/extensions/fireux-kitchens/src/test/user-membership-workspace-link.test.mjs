import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { compile, computed, createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const source = readFileSync(new URL('../runtime/kitchen/components/UserMemberships.vue', import.meta.url), 'utf8')
const script = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
const template = source.slice(source.indexOf('<template>') + 10, source.lastIndexOf('</template>'))

for (const destination of ['/', 'http://workspace.localhost:3001/']) {
  test(`User Kitchen membership entrance renders the shared destination ${destination}`, async () => {
    let resolverCalls = 0
    const state = compileFunction(
      stripTypeScriptTypes(script) + '; return {response, isOwnProfile, subscriptionLabel, summary, teamIssues, teamIssueDescription, cells, canInspect, debugObjects, debugDerived, workspaceEntryHref}',
      ['computed', 'defineProps', 'useKitchenUserMemberships', 'useWorkspaceEntryCta']
    )(computed, () => ({ user: { id: 'operator', display_name: 'Alex' } }), () => ({
      response: ref({ app_user: { subscription: 'free' }, items: [] }),
      pending: ref(false), error: ref(null), canInspect: ref(false), isOwnProfile: ref(true),
    }), family => {
      assert.equal(family, 'kitchen')
      resolverCalls++
      return { workspaceEntryHref: ref(destination) }
    })
    const app = createSSRApp({ setup: () => state, render: compile(template) })
    app.component('UPageHeader', { setup: (_, { slots }) => () => h('header', slots.links?.()) })
    app.component('UButton', { props: ['to', 'label'], setup: props => () => h('a', { href: props.to }, props.label) })
    for (const name of ['UBadge', 'UAlert', 'UPageGrid', 'CollectionCell', 'DiagnosticsDebugPanel'])
      app.component(name, { setup: (_, { slots }) => () => h('div', slots.default?.()) })
    const html = await renderToString(app)
    assert.ok(html.includes(`href="${destination}"`))
    assert.ok(!html.includes('href="/workspace/kitchen"'))
    assert.equal(resolverCalls, 1)
  })
}
