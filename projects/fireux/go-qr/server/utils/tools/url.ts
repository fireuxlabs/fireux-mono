import type { GoQrToolContract } from './types'

export type GoQrUrlToolConfig = {
  copy: {
    title: string
    description: string
    ctaLabel: string
    downloadLabel: string
    openTargetLabel: string
  }
  url: {
    label: string
    placeholder: string
    initialValue: string
    invalidMessage: string
  }
  qr: {
    centreLabel: string
  }
}

export const urlTool = {
  id: 'url',
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

export function normalizeUrlToolConfig(input: unknown): GoQrUrlToolConfig {
  const source = record(input)
  const copy = record(source.copy)
  const url = record(source.url)
  const qr = record(source.qr)

  return {
    copy: {
      title: text(copy.title),
      description: text(copy.description),
      ctaLabel: text(copy.ctaLabel),
      downloadLabel: text(copy.downloadLabel),
      openTargetLabel: text(copy.openTargetLabel),
    },
    url: {
      label: text(url.label),
      placeholder: text(url.placeholder),
      initialValue: text(url.initialValue),
      invalidMessage: text(url.invalidMessage),
    },
    qr: {
      centreLabel: text(qr.centreLabel),
    },
  }
}
