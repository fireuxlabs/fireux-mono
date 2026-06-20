import type { GoQrToolContract } from './types'

export type GoQrDocToolConfig = {
  copy: {
    title: string
    description: string
    ctaLabel: string
    loadingLabel: string
    openTargetLabel: string
  }
  upload: {
    fileLabel: string
    accept: string
    hint: string
    multiple: boolean
  }
  slug: {
    label: string
    placeholder: string
    initialValue: string
    takenMessage: string
    locked: boolean
  }
  preview: {
    baseUrl: string
    pathSuffix: string
    message: string
  }
  endpoints: {
    create: string
    availability: string
  }
}

export const docTool = {
  id: 'doc',
  provider: 'go-qr',
  messageSource: 'go-qr',
  title: '',
  description: '',
  endpoints: {},
  preview: {
    base_url: '',
    path_suffix: '',
  },
} satisfies GoQrToolContract

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const text = (value: unknown) => String(value ?? '').trim()
const boolDefaultTrue = (value: unknown) => value !== false

export function normalizeDocToolConfig(input: unknown): GoQrDocToolConfig {
  const source = record(input)
  const copy = record(source.copy)
  const upload = record(source.upload)
  const slug = record(source.slug)
  const preview = record(source.preview)
  const endpoints = record(source.endpoints)

  return {
    copy: {
      title: text(copy.title),
      description: text(copy.description),
      ctaLabel: text(copy.ctaLabel),
      loadingLabel: text(copy.loadingLabel),
      openTargetLabel: text(copy.openTargetLabel),
    },
    upload: {
      fileLabel: text(upload.fileLabel),
      accept: text(upload.accept),
      hint: text(upload.hint),
      multiple: boolDefaultTrue(upload.multiple),
    },
    slug: {
      label: text(slug.label),
      placeholder: text(slug.placeholder),
      initialValue: text(slug.initialValue),
      takenMessage: text(slug.takenMessage),
      locked: Boolean(slug.locked),
    },
    preview: {
      baseUrl: text(preview.baseUrl),
      pathSuffix: text(preview.pathSuffix),
      message: text(preview.message),
    },
    endpoints: {
      create: text(endpoints.create),
      availability: text(endpoints.availability),
    },
  }
}

export function hasDocToolStorageEndpoints(input: unknown) {
  const endpoints = record(record(input).endpoints)

  return Boolean(text(endpoints.create) && text(endpoints.availability))
}
