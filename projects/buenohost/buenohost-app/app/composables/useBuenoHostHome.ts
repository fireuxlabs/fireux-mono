import { toDataURL } from 'qrcode'
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import {
  consoleFeatures,
  extraInfoBullets,
  guestAppPreview,
  integrationCards,
  previewInfoPath,
  pricingPlans,
  stickerTopics,
  type IntegrationAppKey,
  type IntegrationCard,
  type PublicAppInfo,
} from '../content/home'

export function useBuenoHostHome() {
  const qrTargetUrl = ref('')
  const qrDataUrl = ref('')
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public as Record<string, unknown>
  const defaultBuenoHostBaseUrl = 'https://buenohost.web.app'

  const defaultIntegrationBaseUrls: Record<IntegrationAppKey, string> = {
    fireux: 'https://fireux.app',
    misebox: 'https://misebox.app',
    // The hosting site is a legacy physical identifier until a remote migration is approved.
    werkbox: 'https://cleanbox.web.app',
    sproochli: 'https://sproochli.web.app',
    findMySeo: 'https://find-my-seo.web.app',
  }
  
  const localIntegrationBaseUrls: Record<IntegrationAppKey, string> = {
    fireux: 'http://localhost:3000',
    misebox: 'http://localhost:3001',
    werkbox: 'http://localhost:3002',
    sproochli: 'http://localhost:3011',
    findMySeo: 'http://localhost:3010',
  }
  
  const integrationAppInfo = ref<Partial<Record<IntegrationAppKey, PublicAppInfo>>>({})

  const resolvedIntegrationCards = computed(() =>
    integrationCards.map((card) => ({
      ...card,
      brandSrc: card.appKey ? resolveIntegrationBrandSrc(card.appKey) : '',
      href: resolveIntegrationHref(card),
    }))
  )

  function configString(key: string): string {
    const value = publicConfig[key]
    return typeof value === 'string' ? value.trim() : ''
  }

  function normalizeBaseUrl(value: string): string {
    return value.trim().replace(/\/+$/, '')
  }

  function integrationBaseUrls(appKey: IntegrationAppKey): string[] {
    const configured = configString(`${appKey}BaseUrl`)
    if (configured) return [normalizeBaseUrl(configured)]

    const urls: string[] = []

    if (import.meta.client && window.location.hostname === 'localhost') {
      urls.push(localIntegrationBaseUrls[appKey])
    }

    urls.push(defaultIntegrationBaseUrls[appKey])
    return [...new Set(urls.map(normalizeBaseUrl).filter(Boolean))]
  }

  function integrationInfoUrls(appKey: IntegrationAppKey): string[] {
    return integrationBaseUrls(appKey).map((baseUrl) => `${baseUrl}/api/public/app/info`)
  }

  function resolveIntegrationBrandSrc(appKey: IntegrationAppKey): string {
    const media = integrationAppInfo.value[appKey]?.app?.media
    return media?.wordmark_dark_url || media?.logo_url || media?.wordmark_light_url || ''
  }

  function resolveIntegrationHref(card: IntegrationCard): string {
    if (card.href) return card.href
    if (!card.appKey) return '#'

    return (
      integrationAppInfo.value[card.appKey]?.app?.social_links?.website ||
      defaultIntegrationBaseUrls[card.appKey] ||
      '#'
    )
  }

  function isExternalUrl(value: string): boolean {
    return /^https?:\/\//i.test(value)
  }

  async function fetchIntegrationAppInfo(appKey: IntegrationAppKey): Promise<void> {
    for (const url of integrationInfoUrls(appKey)) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        })
        if (!response.ok) continue

        const data = (await response.json()) as PublicAppInfo
        integrationAppInfo.value = {
          ...integrationAppInfo.value,
          [appKey]: data,
        }
        return
      } catch {
        // Try the next configured endpoint before falling back to the card icon.
      }
    }
  }

  onMounted(async () => {
    const configuredBaseUrl = configString('buenoHostBaseUrl')
    const baseUrl = configuredBaseUrl || (import.meta.client ? window.location.origin : defaultBuenoHostBaseUrl)

    qrTargetUrl.value = new URL(previewInfoPath, normalizeBaseUrl(baseUrl)).toString()
    qrDataUrl.value = await toDataURL(qrTargetUrl.value, {
      width: 512,
      margin: 1,
      errorCorrectionLevel: 'H',
    })

    await Promise.all(
      integrationCards
        .map((card) => card.appKey)
        .filter((appKey): appKey is IntegrationAppKey => Boolean(appKey))
        .map((appKey) => fetchIntegrationAppInfo(appKey))
    )
  })

  return {
    consoleFeatures,
    extraInfoBullets,
    guestAppPreview,
    isExternalUrl,
    previewInfoPath,
    pricingPlans,
    qrDataUrl,
    resolvedIntegrationCards,
    stickerTopics,
  }
}
