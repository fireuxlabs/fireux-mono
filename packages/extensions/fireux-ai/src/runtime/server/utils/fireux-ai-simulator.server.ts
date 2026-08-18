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
  const invitationMatch =
    question.match(
      /\b(?:invite|invitation)(?:\s+link)?\s+(?:for|to)\s+([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)\b/iu
    ) ||
    question.match(
      /\b(?:invite|invitation)\s+([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)\b/iu
    )
  if (invitationMatch) {
    return JSON.stringify({
      action: 'create_member_invitation',
      agent: 'TeamAI',
      name: invitationMatch[1].trim(),
    })
  }
  const match = question.match(
    /\b(?:add|create)\s+(?:a\s+)?(?:(?:new\s+)?team\s+member\s+)?(?:named\s+|called\s+)?([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)?)(?:\s+to\s+(?:the\s+)?team)?[.!?]*$/iu
  )
  if (!match) return JSON.stringify({ action: 'none' })
  const name = match[1]
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return JSON.stringify({
    action: 'create_team_member',
    agent: 'TeamAI',
    name,
  })
}

function sourceText(input: unknown) {
  if (typeof input === 'string') return input.trim()
  const data = record(input)
  return firstString(data.text, data.content, data.value) || ''
}

function simulatedText(request: FireuxAiRequest) {
  const input = record(request.input)
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
