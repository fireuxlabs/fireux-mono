import type {
  FireuxAiConfig,
  FireuxAiRequest,
  FireuxAiResponse,
} from '../../types/ai'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return undefined
}

function menuAnswer(input: Record<string, unknown>) {
  const kitchen = record(input.kitchen)
  const kitchenName = firstString(kitchen.name) || 'This Kitchen'
  const menus = Array.isArray(input.menu_manifest)
    ? input.menu_manifest.map(record)
    : []

  if (!menus.length) return ''

  const question = firstString(input.question) || ''
  const isSummary = /^summari[sz]e\s+(?:(?:these|my|the)\s+)?menus?/i.test(
    question
  )

  if (!isSummary) {
    return 'The local simulator loaded the current Menu records, but this question requires provider reasoning. Switch explicitly to app mode to request a model answer.'
  }

  const summaries = menus.map((menu) => {
    const name = firstString(menu.name, menu.id) || 'Menu'
    const sections = Array.isArray(menu.sections)
      ? menu.sections.map(record)
      : []
    const sectionCount = Number(menu.section_count) || sections.length
    const itemCount = Number(menu.item_count) || 0
    const breakdown = sections
      .map((section) => {
        const label = firstString(section.label)
        const count = Number(section.item_count) || 0
        return label ? `${label} (${count})` : ''
      })
      .filter(Boolean)
      .join(', ')

    return `${name} (${sectionCount} sections, ${itemCount} items${breakdown ? `: ${breakdown}` : ''})`
  })

  return `${kitchenName} has ${menus.length} current ${menus.length === 1 ? 'Menu' : 'Menus'}. ${summaries.join('; ')}.`
}

function kitchenSummary(
  input: Record<string, unknown>,
  context: Record<string, unknown>
) {
  if (input.simulator_kind !== 'kitchen_summary') return ''
  const kitchen = record(input.kitchen)
  const name = firstString(kitchen.name) || 'This Kitchen'
  const tagline = firstString(kitchen.tagline)
  const menuAgent = record(record(input.operation_agents).MenuAI)
  const menuManifest = input.menu_manifest || menuAgent.menu_manifest
  const menus = Array.isArray(menuManifest) ? menuManifest.map(record) : []
  const menuSummary = menus
    .map((menu) => {
      const menuName = firstString(menu.name, menu.id) || 'Menu'
      const sections = Number(menu.section_count) || 0
      const items = Number(menu.item_count) || 0
      return `${menuName} (${sections} sections, ${items} items)`
    })
    .join(', ')
  const knowledge = [
    firstString(kitchen.context),
    firstString(context.kitchen_context),
    firstString(context.menu_context),
  ].filter(Boolean)

  return [
    `${name}${tagline ? ` — ${tagline}` : ''}.`,
    menus.length
      ? `It has ${menus.length} current ${menus.length === 1 ? 'Menu' : 'Menus'}: ${menuSummary}.`
      : 'It has no current Menus in the authorized records.',
    knowledge.length ? `Saved context: ${knowledge.join(' ')}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function kitchenTeamToolSelection(input: Record<string, unknown>) {
  if (input.simulator_kind !== 'kitchen_team_tool_selection') return ''
  const question = firstString(input.question) || ''
  const teamAgent = record(record(input.operation_agents).TeamAI)
  const allowedTools = Array.isArray(teamAgent.allowed_tools)
    ? teamAgent.allowed_tools.map(record)
    : []
  const asksAboutCapabilities =
    /\b(?:what|which)\b[^?]*\b(?:tools?|capabilit(?:y|ies)|can (?:i|you))\b/iu.test(
      question
    ) || /\bwhat can (?:i|you) do\b/iu.test(question)
  if (asksAboutCapabilities && allowedTools.length) {
    const descriptions = allowedTools
      .map((tool) => firstString(record(tool.context).instruction))
      .filter(Boolean)
    return JSON.stringify({
      kind: 'answer',
      agent: 'TeamAI',
      answer: `You can use Team tools to ${descriptions
        .map((description) => description!.replace(/\.$/, '').toLowerCase())
        .join('; ')}. Write actions ask for confirmation before they run.`,
    })
  }
  const members = Array.isArray(input.team_members)
    ? input.team_members.map(record)
    : []
  const memberNamed = (value: string) =>
    members.find(
      (member) =>
        firstString(member.name)?.toLocaleLowerCase() ===
        value.trim().toLocaleLowerCase()
    )
  const call = (toolId: string, toolInput: Record<string, unknown>) =>
    JSON.stringify({
      kind: 'tool',
      agent: 'TeamAI',
      toolCall: { toolId, input: toolInput },
    })

  if (
    /\b(?:who|which people|list|show)\b[^?]*\b(?:team|members?|people)\b/iu.test(
      question
    )
  ) {
    return call('kitchen.team.read-members', {})
  }
  const invitationMatch =
    question.match(
      /\b(?:invite|invitation)(?:\s+link)?\s+(?:for|to)\s+([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)\b/iu
    ) ||
    question.match(
      /\b(?:invite|invitation)\s+([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)\b/iu
    )
  if (invitationMatch) {
    const member = memberNamed(invitationMatch[1] || '')
    const memberId = firstString(member?.memberId)
    return memberId
      ? call('kitchen.team.create-invitation', { memberId })
      : JSON.stringify({ kind: 'none', agent: 'TeamAI' })
  }
  const renameMatch = question.match(
    /\b(?:rename|change|update)\s+([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)\s+(?:to|as)\s+([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)\b/iu
  )
  if (renameMatch) {
    const member = memberNamed(renameMatch[1] || '')
    const memberId = firstString(member?.memberId)
    return memberId
      ? call('kitchen.team.update-member', {
          updates: [
            { memberId, changes: { name: (renameMatch[2] || '').trim() } },
          ],
        })
      : JSON.stringify({ kind: 'none', agent: 'TeamAI' })
  }
  if (/\b(?:title\s*case|capital(?:ise|ize))\b/iu.test(question)) {
    const titleCase = (value: string) =>
      value.replace(/\b\p{L}/gu, (character) => character.toLocaleUpperCase())
    const updates = members.flatMap((member) => {
      const memberId = firstString(member.memberId)
      const currentName = firstString(member.name)
      const nextName = currentName ? titleCase(currentName) : ''
      return memberId && currentName && nextName !== currentName
        ? [{ memberId, changes: { name: nextName } }]
        : []
    })
    return updates.length
      ? call('kitchen.team.update-member', { updates })
      : JSON.stringify({
          kind: 'answer',
          agent: 'TeamAI',
          answer: 'All current Team member names already use title case.',
        })
  }
  const deleteMatch = question.match(
    /\b(?:delete|remove)\s+(?:team\s+member\s+)?([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)\b/iu
  )
  if (deleteMatch) {
    const member = memberNamed(deleteMatch[1] || '')
    const memberId = firstString(member?.memberId)
    return memberId
      ? call('kitchen.team.delete-member', { memberId })
      : JSON.stringify({ kind: 'none', agent: 'TeamAI' })
  }
  const match = question.match(
    /\b(?:add|create)\s+(?:a\s+)?(?:(?:new\s+)?(?:team\s+)?member\s+)?(?:named\s+|called\s+)?([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)(?:\s+to\s+(?:the\s+)?team)?[.!?]*$/iu
  )
  if (!match) return JSON.stringify({ kind: 'none', agent: 'TeamAI' })
  const name = (match[1] || '')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return call('kitchen.team.create-member', { name })
}

function kitchenTeamPromptSuggestions(input: Record<string, unknown>) {
  if (input.simulator_kind !== 'kitchen_team_prompt_suggestions') return ''
  const teamAgent = record(record(input.operation_agents).TeamAI)
  const toolIds = new Set(
    (Array.isArray(teamAgent.allowed_tools) ? teamAgent.allowed_tools : [])
      .map(record)
      .map((tool) => firstString(tool.id))
      .filter((id): id is string => Boolean(id))
  )
  const members = Array.isArray(input.team_members)
    ? input.team_members.map(record)
    : []
  const namedMembers = members.filter((member) => firstString(member.name))
  const unlinkedMember = namedMembers.find((member) => !member.linked)
  const casingMember = namedMembers.find((member) => {
    const name = firstString(member.name) || ''
    const titleCase = name.replace(/\b\p{L}/gu, (character) =>
      character.toLocaleUpperCase()
    )
    return name !== titleCase
  })
  const suggestions = []
  if (toolIds.has('kitchen.team.read-members')) {
    suggestions.push('Who is currently on my Team?')
  }
  if (toolIds.has('kitchen.team.create-member')) {
    suggestions.push('Add a new Team member named Alex')
  }
  if (
    toolIds.has('kitchen.team.create-invitation') &&
    firstString(unlinkedMember?.name)
  ) {
    suggestions.push(
      `Create an invitation for ${firstString(unlinkedMember?.name)}`
    )
  }
  if (toolIds.has('kitchen.team.update-member') && namedMembers.length) {
    suggestions.push(
      casingMember
        ? 'Make sure all Team member names use title case'
        : `Rename ${firstString(namedMembers[0]?.name)} to a new name`
    )
  }
  return JSON.stringify({ suggestions: suggestions.slice(0, 4) })
}

function sourceText(input: unknown) {
  if (typeof input === 'string') return input.trim()
  const data = record(input)
  return firstString(data.text, data.content, data.value) || ''
}

function simulatedText(request: FireuxAiRequest) {
  const input = record(request.input)
  const teamPromptSuggestions = kitchenTeamPromptSuggestions(input)
  if (teamPromptSuggestions) return teamPromptSuggestions
  const teamToolSelection = kitchenTeamToolSelection(input)
  if (teamToolSelection) return teamToolSelection
  const summary = kitchenSummary(input, record(request.context))
  if (summary) return summary
  const answer = menuAnswer(input)
  if (answer) return answer

  if (request.task === 'extract_structured_data') {
    return JSON.stringify(input.data ?? input)
  }

  const value = sourceText(request.input)
  if (value) return value

  return 'The simulator received no text it can return safely.'
}

export function simulateFireuxAiText(
  request: FireuxAiRequest,
  config: FireuxAiConfig
): FireuxAiResponse<string> {
  const result = simulatedText(request)

  return {
    ok: true,
    task: request.task,
    data: result,
    text: result,
    provider: config.provider,
    model: firstString(request.model, config.model),
    execution: 'simulator',
  }
}
