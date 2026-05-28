import { useRuntimeConfig } from '#imports'
import {
  maxGoQrTextLength,
  reservedGoQrTextIds,
} from './goQrTextRecords'
import { goQrProviderBaseUrl } from './goQrToolContracts'

export function textToolContract() {
  const runtime = useRuntimeConfig()
  const baseUrl = goQrProviderBaseUrl()
  const textBaseUrl = `${baseUrl}/text`

  return {
    ok: true,
    provider: {
      id: 'go-qr',
      app_info_url: '/api/public/app/info',
      base_url: baseUrl,
    },
    tool: {
      id: 'text',
      name: 'Text',
      upload_type: 'text',
      max_text_length: maxGoQrTextLength,
      anonymous_max_creates: 1,
      result: {
        target_path_pattern: '/text/:slug',
        qr_path_pattern: '/text/:slug/qr',
        label: 'Text',
      },
    },
    endpoints: {
      availability: '/api/tools/text/availability',
      create: '/api/tools/text/create',
      app_info: '/api/public/app/info',
    },
    slug: {
      label: 'Text path',
      validation_label: 'Text path',
      placeholder: 'my-text',
      reserved: reservedGoQrTextIds,
      taken_message: 'This text path is already taken.',
    },
    ui: {
      title: 'Write text. Get a QR code.',
      description: 'Turn a short message into a shareable QR page.',
      text_label: 'Message',
      text_placeholder: 'See you at table 4',
      cta_label: 'Generate QR code',
      loading_label: 'Generating QR code...',
      success_title: 'Your QR code is ready',
      open_target_label: 'Open message',
      open_qr_label: 'Open QR page',
    },
    preview: {
      base_url: textBaseUrl,
      path_suffix: '/qr',
    },
    runtime: {
      site_url: String(runtime.public?.fireux?.siteUrl || ''),
    },
  }
}
