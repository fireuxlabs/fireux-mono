export type GoQrToolId = 'doc' | 'text'

export type GoQrToolContract = {
  id: GoQrToolId
  message: string
}

const tools = {
  doc: {
    id: 'doc',
    message: 'hello world',
  },
  text: {
    id: 'text',
    message: 'hello world',
  },
} satisfies Record<GoQrToolId, GoQrToolContract>

export function goQrTool(id: GoQrToolId) {
  return tools[id]
}
