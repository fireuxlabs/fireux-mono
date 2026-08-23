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
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/operation-capabilities.ts'
  const operationCapabilities = await source(repoRoot, operationCapabilityFile)
  if (
    !operationCapabilities.includes('const researchTools =') ||
    !operationCapabilities.includes('.toolHypotheses)') ||
    operationCapabilities.includes('const requested =')
  ) {
    violations.push(
      `${operationCapabilityFile}: capability Tools must project the capability-owned search-demand hypotheses instead of maintaining a second requested-Tool catalogue.`
    )
  }
  const definitionFiles = (await readdir(join(repoRoot, definitionRoot)))
    .filter((file) => file.endsWith('.ts'))
    .filter((file) => !['index.ts', 'registry.ts', 'types.ts'].includes(file))
    .sort()
  const ids = []

  const miseDefinitionRoot =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/tools/mise'
  const miseDefinitionFiles = [
    'create-prep-task.ts',
    'update-prep-task.ts',
    'change-prep-status.ts',
    'delete-prep-task.ts',
  ]
  const miseDefinitions = await Promise.all(
    miseDefinitionFiles.map((file) =>
      source(repoRoot, `${miseDefinitionRoot}/${file}`)
    )
  )
  const miseRegistry = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/tools/mise/index.ts'
  )
  const miseSurface = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Operations/CapabilityTools.vue'
  )
  const miseRecordSurfaces = await Promise.all(
    ['Edit.vue', 'Write.vue', 'Delete.vue'].map((file) =>
      source(
        repoRoot,
        `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Operations/Mise/${file}`
      )
    )
  )
  if (
    ![
      'kitchen.mise.create-prep-task',
      'kitchen.mise.update-prep-task',
      'kitchen.mise.change-prep-status',
      'kitchen.mise.delete-prep-task',
    ].every((id) =>
      miseDefinitions.some((definition) => definition.includes(`id: '${id}'`))
    ) ||
    miseDefinitions.some(
      (definition) => !definition.includes('agent: { callable: false }')
    ) ||
    !miseRegistry.includes('kitchenMiseHumanTools') ||
    !miseSurface.includes('WorkspaceKitchenOperationsMiseTools') ||
    ![
      'kitchenMisePrepTaskUpdateTool',
      'kitchenMisePrepStatusChangeTool',
      'kitchenMisePrepTaskDeleteTool',
    ].every((tool) =>
      miseRecordSurfaces.some((surface) => surface.includes(tool))
    )
  ) {
    violations.push(
      'Kitchen Mise must project Add prep task from its domain-owned human tool registry.'
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
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/operation-agents.ts'
  )
  if (
    !operationAgents.includes('kitchenTeamAgentToolIds') ||
    operationAgents.includes("'kitchen.team.")
  ) {
    violations.push(
      'Kitchen operation agents must project Team tool ids from the canonical registry.'
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
      'The Team operation toolbar must expose Create member only; record actions stay with the collection or detail and dossier onboarding stays with AI tools.'
    )
  }

  const teamRead = await source(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Read.vue'
  )
  const teamDetailPage =
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/team/[memberSlug].vue'
  if (
    !teamRead.includes('`/workspace/kitchen/team/${memberAnchor(member)}`') ||
    !existsSync(join(repoRoot, teamDetailPage))
  ) {
    violations.push(
      'Read member must link the Team collection to its canonical slug detail route.'
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
    throw new Error(`Operation tool contract drift:\n${violations.join('\n')}`)
  }
  console.log(
    '[guard] ✅ Kitchen operation tools project from their domain-owned registries'
  )
}
