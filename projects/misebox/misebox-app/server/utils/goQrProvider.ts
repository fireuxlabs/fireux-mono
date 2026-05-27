const localGoQrBaseUrl = 'http://localhost:3013'
const defaultGoQrBaseUrl = 'https://go-qr.web.app'

export function goQrProviderBaseUrl() {
  return String(
    process.env.FIREUX_PROVIDER_GO_QR_URL ||
      process.env.GO_QR_PUBLIC_URL ||
      (process.env.NODE_ENV === 'development' ? localGoQrBaseUrl : defaultGoQrBaseUrl)
  ).replace(/\/+$/, '')
}
