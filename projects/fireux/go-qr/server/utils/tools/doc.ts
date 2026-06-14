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
  }
  slug: {
    label: string
    placeholder: string
    initialValue: string
    takenMessage: string
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
  title: 'Doc',
  description: 'Upload a doc, choose a short path, and get a QR page.',
  endpoints: {
    create: '/api/tools/doc/create',
    availability: '/api/tools/doc/availability',
  },
  preview: {
    base_url: 'https://go-qr.web.app/doc',
    path_suffix: '/qr',
  },
} satisfies GoQrToolContract

const defaultDocToolConfig: GoQrDocToolConfig = {
  copy: {
    title: docTool.title,
    description: docTool.description,
    ctaLabel: 'Create doc QR',
    loadingLabel: 'Creating doc...',
    openTargetLabel: 'Open doc',
  },
  upload: {
    fileLabel: 'Doc file',
    accept: 'application/pdf,image/*,.doc,.docx',
    hint: 'PDF, image, DOC, or DOCX. Max 10 MB.',
  },
  slug: {
    label: 'Doc path',
    placeholder: 'doc-path',
    initialValue: '',
    takenMessage: 'This doc path is already taken.',
  },
  preview: {
    baseUrl: docTool.preview.base_url,
    pathSuffix: docTool.preview.path_suffix,
    message: '',
  },
  endpoints: {
    create: docTool.endpoints.create,
    availability: docTool.endpoints.availability,
  },
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const text = (value: unknown, defaultValue: string) => {
  const resolved = String(value ?? '').trim()
  return resolved || defaultValue
}

export function normalizeDocToolConfig(input: unknown): GoQrDocToolConfig {
  const source = record(input)
  const copy = record(source.copy)
  const upload = record(source.upload)
  const slug = record(source.slug)
  const preview = record(source.preview)
  const endpoints = record(source.endpoints)

  return {
    copy: {
      title: text(copy.title, defaultDocToolConfig.copy.title),
      description: text(copy.description, defaultDocToolConfig.copy.description),
      ctaLabel: text(copy.ctaLabel, defaultDocToolConfig.copy.ctaLabel),
      loadingLabel: text(copy.loadingLabel, defaultDocToolConfig.copy.loadingLabel),
      openTargetLabel: text(copy.openTargetLabel, defaultDocToolConfig.copy.openTargetLabel),
    },
    upload: {
      fileLabel: text(upload.fileLabel, defaultDocToolConfig.upload.fileLabel),
      accept: text(upload.accept, defaultDocToolConfig.upload.accept),
      hint: text(upload.hint, defaultDocToolConfig.upload.hint),
    },
    slug: {
      label: text(slug.label, defaultDocToolConfig.slug.label),
      placeholder: text(slug.placeholder, defaultDocToolConfig.slug.placeholder),
      initialValue: text(slug.initialValue, defaultDocToolConfig.slug.initialValue),
      takenMessage: text(slug.takenMessage, defaultDocToolConfig.slug.takenMessage),
    },
    preview: {
      baseUrl: text(preview.baseUrl, defaultDocToolConfig.preview.baseUrl),
      pathSuffix: text(preview.pathSuffix, defaultDocToolConfig.preview.pathSuffix),
      message: text(preview.message, defaultDocToolConfig.preview.message),
    },
    endpoints: {
      create: text(endpoints.create, defaultDocToolConfig.endpoints.create),
      availability: text(endpoints.availability, defaultDocToolConfig.endpoints.availability),
    },
  }
}

export function hasDocToolStorageEndpoints(input: unknown) {
  const endpoints = record(record(input).endpoints)

  return Boolean(text(endpoints.create, '') && text(endpoints.availability, ''))
}
