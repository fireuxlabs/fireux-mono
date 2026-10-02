import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
const runtime = new URL('../../runtime/', import.meta.url)
function evaluate(source, deps, result) {
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const read = (path) => readFileSync(new URL(path, runtime), 'utf8')
const definition = (path, name, deps = {}) =>
  evaluate(
    read(path),
    {
      defineKitchenTeamTool: (x) => x,
      defineFireuxDomainTool: (x) => x,
      defineFireuxCompoundTool: (x) => x,
      ...deps,
    },
    name
  )
const team = [
  ['create-member', 'kitchenTeamMemberCreateTool'],
  ['read-members', 'kitchenTeamMembersReadTool'],
  ['update-member', 'kitchenTeamMemberUpdateTool'],
  ['delete-member', 'kitchenTeamMemberDeleteTool'],
  ['remove-members', 'kitchenTeamMembersRemoveTool'],
  ['create-member-invitation', 'kitchenTeamMemberInvitationCreateTool'],
].map(([file, name]) =>
  definition(`kitchen/tools/team/${file}.ts`, name, {
    workspaceTeamMemberCreatePrimitive: { id: 'workspace.team.create-member' },
  })
)
const review = definition(
  'menu/tools/review-import-draft.ts',
  'kitchenMenuReviewImportDraftTool'
)
const confirm = definition(
  'menu/tools/confirm-import.ts',
  'kitchenMenuConfirmImportTool'
)
const compound = definition(
  'menu/tools/import-from-source.ts',
  'kitchenMenuImportFromSourceTool',
  {
    kitchenMenuReviewImportDraftTool: review,
    kitchenMenuConfirmImportTool: confirm,
    ...Object.fromEntries(
      [
        'documentClassifyPrimitive',
        'fileStorePrimitive',
        'fileUploadsAcceptPrimitive',
        'fileValidatePrimitive',
        'aiDocumentProcessSourcesPrimitive',
        'aiStructuredGenerateJsonPrimitive',
      ].map((name) => [name, { id: name }])
    ),
  }
)
const source = read('pages/tools/kitchen.vue')
const context = evaluate(
  source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1],
  {
    kitchenTeamTools: team,
    kitchenTeamHumanTools: team.filter((tool) => tool.surfaces.human !== false),
    kitchenMenuCompoundTools: [compound],
    kitchenMenuDomainTools: [review, confirm],
    kitchenMenuTools: [review, confirm, compound],
    definePageMeta: () => {},
  },
  '{ groups, teamToolLabel, kitchenTeamTools, kitchenMenuTools, kitchenMenuImportFromSourceTool }'
)

test('menu workflow descriptions do not promise callable AI invocation', () => {
  for (const tool of [review, confirm, compound]) {
    assert.equal(tool.surfaces.human, true)
    assert.equal(tool.surfaces.ai, false)
    assert.equal(tool.ai.runtime.accepted, false)
  }
  assert.ok(compound.steps.every((step) => step.status === 'source-proven'))
})
test('human action directory excludes agent-only destructive/read tools and uses existing import doorway', () => {
  const human = context.groups[0].items
  assert.equal(human.length, 4)
  assert.ok(
    !human.some(
      (tool) =>
        tool.id === 'kitchen.team.remove-members' ||
        tool.id === 'kitchen.team.read-members'
    )
  )
  const remove = team.find((tool) => tool.id === 'kitchen.team.remove-members')
  assert.match(context.teamToolLabel(remove), /Remove several/)
  assert.equal(team.filter((tool) => tool.surfaces.agent.callable).length, 6)
  for (const group of context.groups.slice(1))
    for (const item of group.items) {
      assert.equal(item.to, '/workspace/kitchen/menus/create#import-menu')
      assert.equal(item.actionLabel, 'Open menu import')
    }
  assert.ok(
    existsSync(new URL('pages/workspace/kitchen/menus/create.vue', runtime))
  )
})
test('rendered catalogue labels agent-only tools without a destructive action link', async () => {
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const app = createSSRApp({ setup: () => context, render: compile(template) })
  app.component('UContainer', {
    setup:
      (_, { slots }) =>
      () =>
        h('main', slots.default?.()),
  })
  app.component('NuxtLink', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  })
  app.component('UIcon', { render: () => null })
  const html = await renderToString(app)
  assert.match(html, /Agent only/)
  assert.match(html, /Remove several existing Kitchen Team members/)
  assert.doesNotMatch(
    html,
    /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*kitchen\.team\.remove-members/
  )
  assert.match(html, /not\s+registered as standalone agent-callable tools/)
  assert.match(html, /Open menu import/)
})
