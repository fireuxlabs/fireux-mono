import { goQrBrand } from './goQrBrand'
import { goQrProviderBaseUrl } from './goQrToolContracts'

export function docToolContract() {
  const baseUrl = goQrProviderBaseUrl()

  return {
    ok: true,
    provider: {
      id: 'go-qr',
      name: goQrBrand.name,
      url: goQrBrand.url,
      logo_url: goQrBrand.logo_url,
      app_info_url: '/api/public/app/info',
      base_url: baseUrl,
    },
    tool: {
      id: 'doc',
      name: 'Doc',
      kind: 'doc',
      message: 'hello from Go QR solution doc',
    },
    endpoints: {
      contract: '/api/tools/doc',
      app_info: '/api/public/app/info',
    },
    ui: {
      title: 'Doc',
      description: 'hello from Go QR solution doc',
    },
  }
}
