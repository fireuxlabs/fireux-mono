import type { GoQrToolContract } from './types'

export type GoQrTextToolConfig = {
  copy: {
    title: string
    description: string
  }
  content: {
    message: string
  }
}

export const textTool = {
  id: 'text',
  provider: 'go-qr',
  messageSource: 'go-qr',
  title: '',
  description: '',
} satisfies GoQrToolContract

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const text = (value: unknown) => String(value ?? '').trim()

export function normalizeTextToolConfig(input: unknown): GoQrTextToolConfig {
  const source = record(input)
  const copy = record(source.copy)
  const content = record(source.content)

  return {
    copy: {
      title: text(copy.title),
      description: text(copy.description),
    },
    content: {
      message: text(content.message),
    },
  }
}
