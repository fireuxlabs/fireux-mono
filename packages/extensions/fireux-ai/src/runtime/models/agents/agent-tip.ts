const TIP_MARKER = 'AGENT_TIP:'
const TIP_MAX_LENGTH = 240

export type FireuxAgentTip = {
  agentId: string
  parentId: string
  message: string
}

export function extractFireuxAgentTip(
  value: unknown,
  source: { agentId: string; parentId: string }
) {
  const text = String(value ?? '').trim()
  const lines = text.split('\n')
  const lastLine = lines.at(-1)?.trim() || ''
  if (!lastLine.startsWith(TIP_MARKER)) {
    return { answer: text, tip: undefined }
  }

  const message = lastLine.slice(TIP_MARKER.length).trim()
  if (!message || message.length > TIP_MAX_LENGTH) {
    return { answer: lines.slice(0, -1).join('\n').trim(), tip: undefined }
  }

  return {
    answer: lines.slice(0, -1).join('\n').trim(),
    tip: { ...source, message } satisfies FireuxAgentTip,
  }
}

export const fireuxAgentTipInstruction =
  'If this request exposes a genuinely missing reusable capability, optionally append one final line formatted exactly as AGENT_TIP: <short suggestion>. Otherwise append no tip. A tip is advisory only and must not claim that a tool or agent was created.'
