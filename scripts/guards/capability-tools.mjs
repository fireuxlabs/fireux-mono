// @fireux-script
// last_used: 2026-08-18
// usage_note: run through pnpm guard; protects canonical operation-tool projection.

import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const definitionRoot =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/tools/team'
const executorRoot =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team/tools'
const retiredServerFiles = [
  'create-member-tool.ts',
  'create-invitation-tool.ts',
  'delete-member-tool.ts',
  'read-members-tool.ts',
  'update-member-tool.ts',
]

const source = (repoRoot, file) => readFile(join(repoRoot, file), 'utf8')

export async function run({ repoRoot }) {
  const violations = []
  const operationCapabilityFile =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/capability-tools.ts'
  const operationCapabilities = await source(repoRoot, operationCapabilityFile)
  if (
    !operationCapabilities.includes('const researchTools =') ||
    !operationCapabilities.includes('.toolHypotheses,') ||
    !operationCapabilities.includes('.records') ||
    !operationCapabilities.includes('requiredRecords: recordIdsForTool') ||
    operationCapabilities.includes('const requested =')
  ) {
    violations.push(
      `${operationCapabilityFile}: capability Tools must project hypotheses and required record ids from the capability-owned research source instead of maintaining a second catalogue.`
    )
  }

  const availableRecordTools = [
    ['dishes', 'create-dish', 'Dishes/Write.vue', 'createDish'],
    ['dishes', 'update-dish', 'Dishes/Edit.vue', 'updateDish'],
    ['dishes', 'delete-dish', 'Dishes/Delete.vue', 'deleteDish'],
    ['drinks', 'create-drink', 'Dishes/Write.vue', 'createDish'],
    ['drinks', 'update-drink', 'Dishes/Edit.vue', 'updateDish'],
    ['drinks', 'delete-drink', 'Dishes/Delete.vue', 'deleteDish'],
    ['recipes', 'create-recipe', 'Recipes/Write.vue', 'createRecipe'],
    ['recipes', 'update-recipe', 'Recipes/Detail.vue', 'updateRecipe'],
    ['recipes', 'delete-recipe', 'Recipes/Detail.vue', 'deleteRecipe'],
    ['menus', 'create-menu', 'Menus/Creation/Index.vue', 'CreationUrl'],
    ['menus', 'update-menu', 'Menus/Edit/Details.vue', 'updateMenu'],
    ['menus', 'delete-menu', 'Menus/Delete.vue', 'deleteMenu'],
    [
      'ingredients',
      'add-ingredient',
      'Ingredients/Write.vue',
      'selectIngredient',
    ],
    [
      'stations',
      'create-station',
      'Stations/Write.vue',
      'createKitchenStation',
    ],
    ['waste', 'record-event', 'Waste/Create.vue', 'recordWaste'],
  ]
  const kitchenComponentRoot =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace'
  for (const [capability, action, component, proof] of availableRecordTools) {
    const catalogueFile = `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/${capability}-search-demand.ts`
    const catalogue = await source(repoRoot, catalogueFile)
    const toolId = `kitchen.${capability}.${action}`
    const availablePattern = new RegExp(
      `id:\\s*'${toolId.replaceAll('.', '\\.')}'[\\s\\S]{0,1800}?status:\\s*'available'`
    )
    if (!availablePattern.test(catalogue)) {
      violations.push(
        `${catalogueFile}: ${toolId} must remain explicitly available while its guarded surface exists.`
      )
    }
    const componentFile = `${kitchenComponentRoot}/${component}`
    const componentSource = await source(repoRoot, componentFile)
    if (!componentSource.includes(proof)) {
      violations.push(
        `${componentFile}: ${toolId} is advertised as available but its ${proof} proof is missing.`
      )
    }
  }

  const menuCatalogue = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/menus-search-demand.ts'
  )
  if (menuCatalogue.includes("id: 'kitchen.menus.import-menu'")) {
    violations.push(
      'Create Menu already owns its AI-assisted source import; Menu Import must not reappear as a second Tool.'
    )
  }
  const definitionFiles = (await readdir(join(repoRoot, definitionRoot)))
    .filter((file) => file.endsWith('.ts'))
    .filter((file) => !['index.ts', 'registry.ts', 'types.ts'].includes(file))
    .sort()
  const ids = []

  const wasteDefinition = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/tools/waste/record-event.ts'
  )
  const wasteRegistry = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/tools/waste/index.ts'
  )
  if (
    !wasteDefinition.includes("id: 'kitchen.waste.record-event'") ||
    !wasteDefinition.includes('inputSchema:') ||
    !wasteDefinition.includes('agent: { callable: false }') ||
    !wasteRegistry.includes('kitchenWasteHumanTools') ||
    !operationCapabilities.includes('kitchenWasteEventRecordTool')
  ) {
    violations.push(
      'Kitchen Waste must project Record Waste from its domain-owned human Tool definition.'
    )
  }
  for (const file of definitionFiles) {
    const definition = await source(repoRoot, `${definitionRoot}/${file}`)
    const id = definition.match(/\bid:\s*'([^']+)'/)?.[1]
    if (!id || !/^kitchen\.team\.[a-z]+(?:-[a-z]+)*$/.test(id)) {
      violations.push(
        `${definitionRoot}/${file}: expected one canonical kitchen.team.* id.`
      )
    } else {
      ids.push(id)
    }
    for (const required of [
      'context:',
      'inputSchema:',
      'confirmation:',
      'surfaces:',
    ]) {
      if (!definition.includes(required)) {
        violations.push(`${definitionRoot}/${file}: missing ${required}`)
      }
    }
    if (/\bsuggestion\s*:/.test(definition)) {
      violations.push(
        `${definitionRoot}/${file}: tools declare capabilities, not authored prompt suggestions.`
      )
    }
    const executorFile = `${executorRoot}/${file}`
    if (!existsSync(join(repoRoot, executorFile))) {
      violations.push(`${executorFile}: missing executor for ${id || file}.`)
      continue
    }
    const executor = await source(repoRoot, executorFile)
    if (
      !executor.includes(' as definition ') ||
      !executor.includes('prepare(') ||
      !executor.includes('execute(')
    ) {
      violations.push(
        `${executorFile}: must bind the definition to preparation and execution.`
      )
    }
  }

  if (new Set(ids).size !== ids.length) {
    violations.push(`${definitionRoot}: tool ids must be unique.`)
  }

  const definitionRegistry = await source(
    repoRoot,
    `${definitionRoot}/registry.ts`
  )
  const executorRegistry = await source(repoRoot, `${executorRoot}/registry.ts`)
  for (const file of definitionFiles) {
    const stem = file.replace(/\.ts$/, '')
    if (!definitionRegistry.includes(`'./${stem}'`)) {
      violations.push(
        `${definitionRoot}/registry.ts: does not register ${file}.`
      )
    }
    if (!executorRegistry.includes(`'./${stem}'`)) {
      violations.push(`${executorRoot}/registry.ts: does not register ${file}.`)
    }
  }

  const operationAgents = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/capability-agents.ts'
  )
  const agentDefinitions = operationAgents.slice(
    operationAgents.indexOf('const definitions = {'),
    operationAgents.indexOf('} as const satisfies Record<')
  )
  const capabilitySlugs = [
    ...agentDefinitions.matchAll(/^  ['"]?([a-z]+(?:-[a-z]+)*)['"]?: \{$/gm),
  ].map((match) => match[1])
  for (const slug of capabilitySlugs) {
    const landingContentFile = `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/${slug}/content-landing.md`
    if (!existsSync(join(repoRoot, landingContentFile))) {
      violations.push(
        `${landingContentFile}: every registered Kitchen capability requires human-readable landing context.`
      )
      continue
    }
    const landingContent = await source(repoRoot, landingContentFile)
    const wordCount = landingContent.trim().split(/\s+/).length
    if (
      !/^# Kitchen /m.test(landingContent) ||
      landingContent.trim().split(/\n\s*\n/).length < 4 ||
      wordCount > 140
    ) {
      violations.push(
        `${landingContentFile}: expected one Kitchen heading plus concise purpose, support, state, and evidence-boundary paragraphs (140 words maximum).`
      )
    }
    const capabilityHeaderFile =
      slug === 'orders'
        ? 'packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-orders.vue'
        : `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/${slug}/index.vue`
    const capabilityHeader = await source(repoRoot, capabilityHeaderFile)
    const hasCapabilityContext =
      slug === 'team'
        ? capabilityHeader.includes('<WorkspaceIntroInfo :intro="liveIntro"')
        : slug === 'identity'
          ? capabilityHeader.includes(
              '<WorkspaceIntroInfo :intro="identity.intro.value"'
            )
          : capabilityHeader.includes(
              'WorkspaceKitchenCapabilityContextInfo'
            ) && capabilityHeader.includes(`capability="${slug}"`)
    if (!hasCapabilityContext) {
      violations.push(
        `${capabilityHeaderFile}: registered Kitchen capability pages must expose their context modal in the page header.`
      )
    }
  }
  const kitchenWorkspaceContentFile =
    'projects/misebox/misebox-app/app/content/kitchen/content-landing.md'
  const kitchenWorkspaceContent = await source(
    repoRoot,
    kitchenWorkspaceContentFile
  )
  const kitchenWorkspacePage = await source(
    repoRoot,
    'projects/misebox/misebox-app/app/pages/index.vue'
  )

  if (
    !kitchenWorkspaceContent.includes('# Misebox Kitchen Workspace') ||
    !kitchenWorkspaceContent.includes('upgrade to Business') ||
    kitchenWorkspaceContent.trim().split(/\s+/).length > 140
  ) {
    violations.push(
      `${kitchenWorkspaceContentFile}: Misebox Kitchen Workspace context must remain concise and state the Business multi-Kitchen boundary.`
    )
  }
  if (
    !kitchenWorkspacePage.includes('LayoutsWorkspaceNavbar') ||
    !kitchenWorkspacePage.includes('<WorkspaceIntroInfo :intro="intro"')
  ) {
    violations.push(
      'Misebox / must expose its layer-zero introduction context from the Workspace header.'
    )
  }
  if (
    !operationAgents.includes('kitchenTeamAgentToolIds') ||
    operationAgents.includes("'kitchen.team.")
  ) {
    violations.push(
      'Kitchen operation agents must project Team tool ids from the canonical registry.'
    )
  }
  const kitchenAgentContext = await source(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/runtime/server/agent/kitchen/context.ts'
  )
  const kitchenAgentAnswer = await source(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/runtime/server/agent/kitchen/answer.ts'
  )
  if (
    !kitchenAgentAnswer.includes(
      "findMiseboxOperationAgent('kitchen', operation)"
    ) ||
    !kitchenAgentAnswer.includes("requestedAgent?.name || 'KitchenAI'") ||
    /agentName = '(?:Dishes|Recipes|FoodSafety|Stations|Orders)AI'/.test(
      kitchenAgentAnswer
    )
  ) {
    violations.push(
      'KitchenAI must resolve capability agents from the registered catalogue, not a hard-coded agent-name switch.'
    )
  }
  if (
    !/dishes:\s*\{[\s\S]{0,400}?maturity:\s*'connected'/.test(
      operationAgents
    ) ||
    !kitchenAgentContext.includes("request.operation !== 'dishes'") ||
    !kitchenAgentContext.includes("dish.item_kind === 'food'") ||
    !kitchenAgentAnswer.includes("operation === 'dishes'")
  ) {
    violations.push(
      'DishesAI must remain connected to authorized canonical food Dish records through the shared KitchenAI inference path.'
    )
  }
  if (
    !/recipes:\s*\{[\s\S]{0,400}?maturity:\s*'connected'/.test(
      operationAgents
    ) ||
    !kitchenAgentContext.includes("request.operation !== 'recipes'") ||
    !kitchenAgentContext.includes('normalizeRecipe') ||
    !kitchenAgentAnswer.includes("operation === 'recipes'")
  ) {
    violations.push(
      'RecipesAI must remain connected to authorized canonical Recipe identity records through the shared KitchenAI inference path.'
    )
  }
  if (
    !/'food-safety':\s*\{[\s\S]{0,400}?maturity:\s*'connected'/.test(
      operationAgents
    ) ||
    !kitchenAgentAnswer.includes("operation === 'food-safety'") ||
    !kitchenAgentAnswer.includes("authority: 'research-only'") ||
    !kitchenAgentAnswer.includes("operational_evidence: 'not-connected'") ||
    !kitchenAgentAnswer.includes('kitchenFoodSafetySearchDemand')
  ) {
    violations.push(
      'FoodSafetyAI must keep source research distinct from unavailable operational evidence while using the shared KitchenAI inference path.'
    )
  }
  if (
    !/stations:\s*\{[\s\S]{0,400}?maturity:\s*'connected'/.test(
      operationAgents
    ) ||
    !kitchenAgentContext.includes("request.operation !== 'stations'") ||
    !kitchenAgentContext.includes('normalizeKitchenStation') ||
    !kitchenAgentAnswer.includes("operation === 'stations'")
  ) {
    violations.push(
      'StationsAI must remain connected to authorized canonical Kitchen Station records through the shared KitchenAI inference path.'
    )
  }
  if (
    !/orders:\s*\{[\s\S]{0,400}?maturity:\s*'connected'/.test(
      operationAgents
    ) ||
    !kitchenAgentContext.includes("request.operation !== 'orders'") ||
    !kitchenAgentContext.includes(
      'collection(`kitchens/${request.kitchenId}/orders`)'
    ) ||
    !kitchenAgentAnswer.includes("operation === 'orders'") ||
    !kitchenAgentAnswer.includes("authority: 'advisory-read-only'") ||
    !kitchenAgentAnswer.includes('Customer identity, contact details')
  ) {
    violations.push(
      'OrdersAI must remain a privacy-bounded read-only projection of authorized canonical Kitchen Orders through the shared KitchenAI inference path.'
    )
  }

  const capabilityTools = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenCapabilityTools.ts'
  )
  const workspaceActions = await source(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/runtime/server/agent/kitchen/workspace-actions.ts'
  )
  const targetAwareCapabilities = [
    ['dishes', 'dishActionTargets', ['update-dish', 'delete-dish']],
    ['drinks', 'drinkActionTargets', ['update-drink', 'delete-drink']],
    ['recipes', 'recipeActionTargets', ['update-recipe', 'delete-recipe']],
    ['menus', 'menuActionTargets', ['update-menu', 'delete-menu']],
  ]
  for (const [capability, targets, actions] of targetAwareCapabilities) {
    const page = await source(
      repoRoot,
      `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/${capability}/index.vue`
    )
    if (
      !page.includes(`:action-targets="${targets}"`) ||
      !actions.every((action) =>
        capabilityTools.includes(`'kitchen.${capability}.${action}':`)
      )
    ) {
      violations.push(
        `${capability}: available record Tools must retain their target-aware AI doorway through the existing detail route.`
      )
    }
  }
  if (
    !capabilityTools.includes("kind: 'target-route'") ||
    !workspaceActions.includes('request.actionTargets') ||
    !workspaceActions.includes('targetId: selected.targetId')
  ) {
    violations.push(
      'Target-aware AI doorways must select only supplied canonical record candidates and return the chosen record id to the existing detail route.'
    )
  }

  const humanAdapter = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/team/useKitchenTeamTools.ts'
  )
  if (!humanAdapter.includes('kitchenTeamHumanTools')) {
    violations.push(
      'useKitchenTeamTools must project the human surface from the canonical registry.'
    )
  }

  const teamToolbar = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Tools.vue'
  )
  if (
    !teamToolbar.includes("'kitchen.team.create-member'") ||
    /kitchen\.team\.(?:update-member|delete-member|create-invitation)|DossierOnboarding|ToolModal/.test(
      teamToolbar
    )
  ) {
    violations.push(
      'The Team capability toolbar must expose Create member only; record actions stay with the collection or detail and dossier onboarding stays with AI tools.'
    )
  }

  const teamRead = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Read.vue'
  )
  const teamIndex = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Index.vue'
  )
  const teamDetailPage =
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/team/[memberId].vue'
  if (
    !teamRead.includes("emit('select', member.id)") ||
    !teamIndex.includes(
      '`/workspace/kitchen/team/${encodeURIComponent(selected.id)}`'
    ) ||
    !existsSync(join(repoRoot, teamDetailPage))
  ) {
    violations.push(
      'Team rows must select in place and the selected member must link to its canonical detail route.'
    )
  }

  const teamAgent = await source(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/runtime/server/agent/kitchen/team-tools.ts'
  )
  if (!teamAgent.includes('kitchenTeamAgentTools')) {
    violations.push(
      'Misebox TeamAI must receive its allowed tools from the canonical registry.'
    )
  }
  if (
    /create_team_member|create_member_invitation|read_team_members|update_team_member|delete_team_member/.test(
      teamAgent
    )
  ) {
    violations.push(
      'Misebox TeamAI must return canonical tool calls, not a bespoke action enum.'
    )
  }

  const teamRuntime = await source(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/runtime/server/agent/kitchen/team.ts'
  )
  if (
    !teamRuntime.includes('findKitchenTeamServerTool') ||
    teamRuntime.includes("'kitchen.team.") ||
    /kitchenTeamMember(?:Create|Read|Update|Delete|Invitation)/.test(
      teamRuntime
    )
  ) {
    violations.push(
      'Misebox TeamAI runtime must prepare and execute through generic registry lookup.'
    )
  }

  const teamPresentation = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/team/useKitchenTeamAI.ts'
  )
  if (
    !teamPresentation.includes('/api/workspace/kitchen/agent/suggestions') ||
    /Add a new Team member|Who is currently on my Team|Create an invitation for/.test(
      teamPresentation
    )
  ) {
    violations.push(
      'useKitchenTeamAI must load inferred suggestions rather than authoring tool prompts.'
    )
  }

  for (const file of retiredServerFiles) {
    const retired = join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team',
      file
    )
    if (existsSync(retired)) {
      violations.push(
        `${retired}: retired duplicate tool metadata must stay removed.`
      )
    }
  }

  if (violations.length) {
    throw new Error(`Capability tool contract drift:\n${violations.join('\n')}`)
  }
  console.log(
    '[guard] ✅ Kitchen capability tools project from their domain-owned registries'
  )
}
