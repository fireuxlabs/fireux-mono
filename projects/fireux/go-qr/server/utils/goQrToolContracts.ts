import { useRuntimeConfig } from '#imports'

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
