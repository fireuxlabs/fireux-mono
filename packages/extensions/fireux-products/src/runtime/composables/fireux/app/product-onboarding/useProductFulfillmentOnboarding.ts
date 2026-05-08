import { computed, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import type { FirebaseProduct } from '../../../../models/product.model'

export type AssetKey =
  | 'onboardingAssetLogo'
  | 'onboardingAssetWordmarkLight'
  | 'onboardingAssetWordmarkDark'
  | 'onboardingAssetCover'
  | 'onboardingAssetThumbnail'
  | 'onboardingAssetPwa192'
  | 'onboardingAssetPwa512'

export const onboardingAssetSpecs: Array<{
  key: AssetKey
  label: string
  note: string
}> = [
  {
    key: 'onboardingAssetLogo',
    label: 'Logo',
    note: 'SVG preferred, PNG ok. Opaque artwork, transparent background.',
  },
  {
    key: 'onboardingAssetWordmarkLight',
    label: 'Wordmark (Light)',
    note: 'SVG preferred, PNG ok. Opaque artwork, transparent background.',
  },
  {
    key: 'onboardingAssetWordmarkDark',
    label: 'Wordmark (Dark)',
    note: 'SVG preferred, PNG ok. Opaque artwork, transparent background.',
  },
  {
    key: 'onboardingAssetCover',
    label: 'Cover Image',
    note: 'PNG 1600x900+. Opaque artwork, transparent background.',
  },
  {
    key: 'onboardingAssetThumbnail',
    label: 'Thumbnail',
    note: 'PNG 1200x1200. Opaque artwork, transparent background.',
  },
  {
    key: 'onboardingAssetPwa192',
    label: 'PWA Icon 192',
    note: 'PNG 192x192. Opaque artwork, transparent background.',
  },
  {
    key: 'onboardingAssetPwa512',
    label: 'PWA Icon 512',
    note: 'PNG 512x512. Opaque artwork, transparent background.',
  },
]

const randomTestImageByAsset: Record<AssetKey, string> = {
  onboardingAssetLogo: 'https://picsum.photos/seed/fireux-logo/800/800',
  onboardingAssetWordmarkLight:
    'https://picsum.photos/seed/fireux-wordmark-light/1600/400',
  onboardingAssetWordmarkDark:
    'https://picsum.photos/seed/fireux-wordmark-dark/1600/400',
  onboardingAssetCover: 'https://picsum.photos/seed/fireux-cover/1600/900',
  onboardingAssetThumbnail:
    'https://picsum.photos/seed/fireux-thumbnail/1200/1200',
  onboardingAssetPwa192: 'https://picsum.photos/seed/fireux-pwa-192/192/192',
  onboardingAssetPwa512: 'https://picsum.photos/seed/fireux-pwa-512/512/512',
}

export function useProductFulfillmentOnboarding(
  productRef?: Ref<Partial<FirebaseProduct> | undefined>
) {
  const appName = useStorage('onboardingAppName', '')
  const appSlug = useStorage('onboardingAppSlug', '')
  const appTagline = useStorage('onboardingAppTagline', '')
  const appSummary = useStorage('onboardingAppSummary', '')
  const appDomain = useStorage('onboardingAppDomain', '')
  const appEcosystem = useStorage('onboardingAppEcosystem', 'fireux-fireux')
  const companyName = useStorage('onboardingCompanyName', '')
  const contactName = useStorage('onboardingContactName', '')
  const contactEmail = useStorage('onboardingContactEmail', '')
  const primaryColor = useStorage('onboardingPrimaryColor', '#0EA5E9')
  const secondaryColor = useStorage('onboardingSecondaryColor', '#111827')
  const heroTitle = useStorage('onboardingHeroTitle', '')
  const heroSubtitle = useStorage('onboardingHeroSubtitle', '')
  const ctaLabel = useStorage('onboardingCtaLabel', 'Get started')
  const ctaHref = useStorage('onboardingCtaHref', '/contact')

  const assetDataByKey = onboardingAssetSpecs.reduce(
    (acc, spec) => {
      acc[spec.key] = useStorage(`${spec.key}Data`, '')
      return acc
    },
    {} as Record<AssetKey, Ref<string>>
  )

  const product = computed(() => productRef?.value)

  const hydratedAppName = computed(
    () => appName.value || product.value?.name || 'FireUX App'
  )
  const hydratedAppSlug = computed(
    () => appSlug.value || product.value?.slug || 'fireux-app'
  )
  const hydratedAppTagline = computed(
    () =>
      appTagline.value ||
      product.value?.tagline ||
      'A professional app, built with FireUX.'
  )
  const hydratedAppSummary = computed(
    () => appSummary.value || product.value?.description || ''
  )

  const requiredContentComplete = computed(() => {
    return Boolean(
      hydratedAppName.value.trim() &&
        hydratedAppSlug.value.trim() &&
        appDomain.value.trim() &&
        companyName.value.trim() &&
        contactName.value.trim() &&
        contactEmail.value.trim() &&
        heroTitle.value.trim() &&
        ctaLabel.value.trim() &&
        ctaHref.value.trim()
    )
  })

  const requiredAssetsComplete = computed(() =>
    onboardingAssetSpecs.every((spec) => Boolean(assetDataByKey[spec.key].value))
  )

  const appCreationPayload = computed(() => {
    return {
      app: {
        id: hydratedAppSlug.value.trim(),
        name: hydratedAppName.value.trim(),
        shortName: hydratedAppName.value.trim().slice(0, 12),
        tagline: hydratedAppTagline.value.trim(),
        summary: hydratedAppSummary.value.trim(),
        domain: appDomain.value.trim(),
        ecosystem: appEcosystem.value.trim() || 'fireux-fireux',
      },
      client: {
        companyName: companyName.value.trim(),
        contactName: contactName.value.trim(),
        contactEmail: contactEmail.value.trim(),
      },
      brand: {
        primaryColor: primaryColor.value.trim(),
        secondaryColor: secondaryColor.value.trim(),
      },
      content: {
        heroTitle: heroTitle.value.trim(),
        heroSubtitle: heroSubtitle.value.trim(),
        ctaLabel: ctaLabel.value.trim(),
        ctaHref: ctaHref.value.trim(),
      },
      assets: onboardingAssetSpecs.reduce(
        (acc, spec) => {
          acc[spec.key] = assetDataByKey[spec.key].value || ''
          return acc
        },
        {} as Record<AssetKey, string>
      ),
      completion: {
        assets: requiredAssetsComplete.value,
        content: requiredContentComplete.value,
      },
    }
  })

  const applySampleContent = () => {
    appName.value = 'FireUX App'
    appSlug.value = 'fireux-app'
    appTagline.value = 'A professional app, built with FireUX.'
    appSummary.value = 'A professional app, built with FireUX.'
    appDomain.value = 'client1.web.app'
    appEcosystem.value = 'fireux-fireux'
    companyName.value = 'Client One'
    contactName.value = 'Client Owner'
    contactEmail.value = 'owner@client1.test'
    primaryColor.value = '#0EA5E9'
    secondaryColor.value = '#111827'
    heroTitle.value = 'Welcome to Client One'
    heroSubtitle.value = 'Fast, professional, and ready to grow.'
    ctaLabel.value = 'Buy now'
    ctaHref.value = '/buy'
  }

  const applyRandomTestAssets = () => {
    onboardingAssetSpecs.forEach((spec) => {
      assetDataByKey[spec.key].value = randomTestImageByAsset[spec.key]
    })
  }

  return {
    onboardingAssetSpecs,
    assetDataByKey,
    appName,
    appSlug,
    appTagline,
    appSummary,
    appDomain,
    appEcosystem,
    companyName,
    contactName,
    contactEmail,
    primaryColor,
    secondaryColor,
    heroTitle,
    heroSubtitle,
    ctaLabel,
    ctaHref,
    requiredAssetsComplete,
    requiredContentComplete,
    appCreationPayload,
    applySampleContent,
    applyRandomTestAssets,
  }
}
