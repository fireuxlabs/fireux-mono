import { useRuntimeConfig } from '#imports'
import {
  maxGoQrFileSizeMb,
  reservedGoQrDocumentIds,
} from './goQrRecords'

function normalizeSiteUrl(input: unknown) {
  const raw = String(input || '').trim()
  if (!raw) return ''
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return ''
  }
}

export function goQrProviderBaseUrl() {
  const runtime = useRuntimeConfig()

  return (
    normalizeSiteUrl(runtime.public?.fireux?.siteUrl) ||
    'https://go-qr.web.app'
  )
}

export function publicDocToolContract() {
  const baseUrl = goQrProviderBaseUrl()

  return {
    ok: true,
    provider: {
      id: 'go-qr',
      app_info_url: '/api/public/app/info',
      base_url: baseUrl,
    },
    tool: {
      id: 'public-doc',
      name: 'Public doc',
      upload_type: 'doc',
      accepts: ['application/pdf', 'image/*', '.doc', '.docx'],
      max_file_size_mb: maxGoQrFileSizeMb,
      anonymous_max_creates: 1,
      result: {
        target_path_pattern: '/:slug',
        qr_path_pattern: '/:slug/qr',
        label: 'Public Doc',
      },
    },
    endpoints: {
      availability: '/api/tools/public-doc/availability',
      create: '/api/tools/public-doc/create',
      app_info: '/api/public/app/info',
    },
    slug: {
      label: 'Document path',
      validation_label: 'Document path',
      placeholder: 'my-doc',
      reserved: reservedGoQrDocumentIds,
      taken_message: 'This doc path is already taken.',
    },
    ui: {
      title: 'Upload a doc. Get a QR code.',
      description: 'Turn a public doc into a shareable QR page.',
      upload_label: 'Upload your doc',
      cta_label: 'Create QR code',
      loading_label: 'Creating QR doc...',
      success_title: 'Your QR doc is ready',
      open_target_label: 'Open doc',
      open_qr_label: 'Open QR page',
    },
    preview: {
      base_url: baseUrl,
      path_suffix: '/qr',
    },
  }
}
