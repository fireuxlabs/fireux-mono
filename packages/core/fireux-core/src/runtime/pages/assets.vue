<template>
  <UPage>
    <UPageHeader
      :title="`${appName} assets`"
      description="App artwork, where it appears, and the component that displays it."
    >
      <template #headline>
        <UBadge color="primary" variant="soft">Asset library</UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <section
        v-for="group in assetGroups"
        :key="group.key"
        class="asset-library__group"
      >
        <header class="asset-library__group-header">
          <h2 class="asset-library__group-title">{{ group.title }}</h2>
          <p class="asset-library__group-description">
            {{ group.description }}
          </p>
        </header>

        <UPageGrid>
          <UCard
            v-for="asset in group.items"
            :key="asset.key"
            variant="subtle"
            class="asset-library__card"
            :ui="{ body: 'fx-card-body-stack' }"
          >
            <div
              class="asset-library__preview"
              :class="[
                `asset-library__preview--${asset.shape}`,
                asset.surface
                  ? `asset-library__preview--${asset.surface}`
                  : undefined,
              ]"
            >
              <AppBrandLogo
                v-if="asset.preview === 'logo'"
                :src="asset.src"
                size="hero"
                :alt="`${asset.label} preview`"
                class="asset-library__brand-logo"
              />
              <AppBrandWordmark
                v-else-if="asset.preview === 'wordmark'"
                :light-src="asset.src"
                :dark-src="asset.src"
                size="hero"
                :alt="`${asset.label} preview`"
                class="asset-library__wordmark"
              />
              <img
                v-else
                :src="asset.src"
                :alt="`${asset.label} preview`"
                loading="lazy"
                decoding="async"
                class="asset-library__image"
              />
            </div>

            <div class="asset-library__details">
              <h3 class="asset-library__asset-title">{{ asset.label }}</h3>
              <p class="asset-library__usage">
                <span>Used by</span>
                <span>{{ asset.usedBy }}</span>
              </p>
              <code class="asset-library__path">{{ asset.src }}</code>
              <p v-if="asset.description" class="asset-library__note">
                {{ asset.description }}
              </p>
            </div>
          </UCard>
        </UPageGrid>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig, useSeoMeta } from '#imports'
import { useFireUXConfig } from '../app/composables/config/FireUXConfig'
import {
  APP_IMAGE_LOCAL_PUBLIC_PATHS,
  APP_LOCAL_ONLY_PUBLIC_PATHS,
} from '../app/models/app-media-requirements'

type AssetSurface = 'light' | 'dark'
type AssetPreview = 'logo' | 'wordmark' | 'image'
type AssetShape = 'square' | 'wide'
type AssetItem = {
  key: string
  label: string
  src: string
  preview: AssetPreview
  shape: AssetShape
  usedBy: string
  surface?: AssetSurface
  description?: string
}
type AssetGroup = {
  key: string
  title: string
  description: string
  items: AssetItem[]
}
type UnknownRecord = Record<string, unknown>

const fireux = useFireUXConfig()
const appConfig = useAppConfig() as UnknownRecord

const appName = computed(() =>
  String(fireux.appName || fireux.appShortName || fireux.appId || 'App')
)

const standardAssetGroups: AssetGroup[] = [
  {
    key: 'brand-logo',
    title: 'AppBrandLogo',
    description: 'The App icon shown by shared identity components.',
    items: [
      {
        key: 'logo',
        label: 'Logo',
        src: APP_IMAGE_LOCAL_PUBLIC_PATHS.logo,
        preview: 'logo',
        shape: 'square',
        usedBy:
          'Tenant auth branding, user creation, tool frame, and default footer.',
      },
    ],
  },
  {
    key: 'brand-wordmark',
    title: 'AppBrandWordmark',
    description:
      'Light and dark wordmarks shown by shared identity components.',
    items: [
      {
        key: 'wordmark-light',
        label: 'Wordmark for light surfaces',
        src: APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkLight,
        preview: 'wordmark',
        shape: 'wide',
        surface: 'light',
        usedBy:
          'Default header/footer, workspace sidebar, landing hero, and non-tenant auth.',
      },
      {
        key: 'wordmark-dark',
        label: 'Wordmark for dark surfaces',
        src: APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkDark,
        preview: 'wordmark',
        shape: 'wide',
        surface: 'dark',
        usedBy:
          'Default header/footer, workspace sidebar, landing hero, and non-tenant auth.',
      },
    ],
  },
  {
    key: 'app-profile',
    title: 'App profile and collection',
    description: 'App media shown on profile and App collection surfaces.',
    items: [
      {
        key: 'cover',
        label: 'Cover',
        src: APP_IMAGE_LOCAL_PUBLIC_PATHS.cover,
        preview: 'image',
        shape: 'wide',
        usedBy: 'AppDetailIndex and AppCollection as the main App image.',
      },
      {
        key: 'thumbnail',
        label: 'Thumbnail',
        src: APP_IMAGE_LOCAL_PUBLIC_PATHS.thumbnail,
        preview: 'image',
        shape: 'wide',
        usedBy:
          'AppDetailIndex and AppCollection as fallback media, and App metadata previews.',
      },
    ],
  },
  {
    key: 'browser-install',
    title: 'Browser and install metadata',
    description: 'Local files used by the browser tab and the installable App.',
    items: [
      {
        key: 'favicon',
        label: 'Favicon',
        src: APP_LOCAL_ONLY_PUBLIC_PATHS.favicon,
        preview: 'image',
        shape: 'square',
        usedBy: 'Nuxt app icon configuration.',
      },
      {
        key: 'pwa-icon-192',
        label: 'PWA icon 192',
        src: APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon192,
        preview: 'image',
        shape: 'square',
        usedBy: 'Nuxt app icon configuration and the web app manifest.',
      },
      {
        key: 'pwa-icon-512',
        label: 'PWA icon 512',
        src: APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon512,
        preview: 'image',
        shape: 'square',
        usedBy: 'The web app manifest.',
      },
    ],
  },
]

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const optionalText = (value: unknown) => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || undefined
}

const configuredAssetItems = computed<AssetItem[]>(() => {
  const config = isRecord(appConfig.fireuxAssets)
    ? appConfig.fireuxAssets
    : undefined
  const catalogue = config?.catalogue
  if (!Array.isArray(catalogue)) return []

  const seen = new Set(
    standardAssetGroups.flatMap((group) =>
      group.items.map((asset) => asset.key)
    )
  )
  const items: AssetItem[] = []

  for (const candidate of catalogue.slice(0, 24)) {
    if (!isRecord(candidate)) continue

    const key = optionalText(candidate.key)
    const label = optionalText(candidate.label)
    const src = optionalText(candidate.src)
    if (!key || !label || !src?.startsWith('/img/app/') || seen.has(key))
      continue

    seen.add(key)
    items.push({
      key,
      label,
      src,
      preview: 'image',
      shape: candidate.wide === true ? 'wide' : 'square',
      description: optionalText(candidate.description),
      usedBy: 'App-specific catalogue; no shared component is registered.',
      surface:
        candidate.surface === 'light' || candidate.surface === 'dark'
          ? candidate.surface
          : undefined,
    })
  }

  return items
})

const assetGroups = computed<AssetGroup[]>(() => [
  ...standardAssetGroups,
  ...(configuredAssetItems.value.length
    ? [
        {
          key: 'app-specific',
          title: `${appName.value} app-specific assets`,
          description:
            'Additional files registered by this App. Their component use is not declared in the shared catalogue.',
          items: configuredAssetItems.value,
        },
      ]
    : []),
])

definePageMeta({
  nav: {
    key: 'assets',
    label: 'Assets',
    icon: 'i-lucide-image',
    order: 30,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})

useSeoMeta({
  title: () => `Assets - ${appName.value}`,
  description: () => `Public assets and their uses in ${appName.value}.`,
  robots: 'noindex,follow',
})
</script>

<style scoped>
.asset-library__group {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.asset-library__group + .asset-library__group {
  margin-block-start: calc(var(--spacing) * 10);
}

.asset-library__group-header {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.asset-library__group-title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.asset-library__group-description,
.asset-library__usage,
.asset-library__note {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.asset-library__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 11rem;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background-color: var(--ui-bg-muted);
  padding: calc(var(--spacing) * 4);
}

.asset-library__preview--wide {
  aspect-ratio: 16 / 9;
}

.asset-library__preview--light {
  background-color: var(--ui-color-neutral-50);
}

.asset-library__preview--dark {
  background-color: var(--ui-color-neutral-950);
}

.asset-library__brand-logo,
.asset-library__wordmark,
.asset-library__image {
  max-inline-size: 100%;
  max-block-size: 100%;
  object-fit: contain;
}

.asset-library__image {
  inline-size: 100%;
}

.asset-library__preview--square .asset-library__image {
  inline-size: min(100%, 10rem);
  max-block-size: 10rem;
}

.asset-library__details {
  display: grid;
  gap: calc(var(--spacing) * 2);
  min-inline-size: 0;
}

.asset-library__asset-title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.asset-library__usage {
  display: grid;
  gap: var(--spacing);
}

.asset-library__usage span:first-child {
  color: var(--ui-text-toned);
  font-weight: var(--font-weight-medium);
}

.asset-library__path {
  overflow-wrap: anywhere;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
</style>
