<template>
  <UPage>
    <UPageHeader
      title="Dev · Images"
      description="These image URLs ship with fireux-core and are available to every app by default."
    />

    <UPageBody class="space-y-6">
      <UCard v-for="group in assetGroups" :key="group.key">
        <template #header>
          <div class="space-y-1">
            <h2 class="text-base font-semibold">{{ group.title }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ group.description }}
            </p>
          </div>
        </template>

        <template v-if="group.assets.length">
          <ul class="space-y-4">
            <li
              v-for="asset in group.assets"
              :key="asset.path"
              class="dev-image-row"
            >
              <div :class="['dev-image-chip', previewToneClass(asset.tone)]">
                <img :src="asset.path" :alt="asset.label" />
              </div>

              <div class="space-y-1 text-sm">
                <code class="block">{{ asset.path }}</code>
                <p class="text-gray-500 dark:text-gray-400">
                  {{ asset.label }}
                </p>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ group.emptyState }}
          </p>
        </template>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
type PreviewTone = 'light' | 'dark' | 'checker'

interface Asset {
  path: string
  label: string
  tone?: PreviewTone
}

interface AssetGroup {
  key: string
  title: string
  description: string
  assets: Asset[]
  emptyState: string
}

// Provide stable metadata for each preview tile.
const coreAssets: Asset[] = [
  {
    path: '/img/core/defaults/default-thumbnail.png',
    label: 'Fallback image placeholder',
    tone: 'checker',
  },
  {
    path: '/img/core/auth/sign-in-dark.svg',
    label: 'Auth illustration · sign-in dark',
  },
  {
    path: '/img/core/auth/sign-in-light.svg',
    label: 'Auth illustration · sign-in light',
    tone: 'dark',
  },
  {
    path: '/img/core/auth/sign-up-dark.svg',
    label: 'Auth illustration · sign-up dark',
  },
  {
    path: '/img/core/auth/sign-up-light.svg',
    label: 'Auth illustration · sign-up light',
    tone: 'dark',
  },
  { path: '/img/core/brand/logo.png', label: 'FireUX logo mark' },
  {
    path: '/img/core/brand/wordmark-dark.png',
    label: 'FireUX wordmark · dark',
  },
  {
    path: '/img/core/brand/wordmark-light.png',
    label: 'FireUX wordmark · light',
    tone: 'dark',
  },
  {
    path: '/img/core/brand/wordmark-light.svg',
    label: 'FireUX wordmark · light (SVG)',
    tone: 'dark',
  },
]

const assetGroups: AssetGroup[] = [
  {
    key: 'core',
    title: 'fireux-core public assets',
    description:
      'Shared identity and UX assets exposed from packages/core/fireux-core.',
    assets: coreAssets,
    emptyState:
      'No core assets registered. Add shared assets under /img/core before listing them here.',
  },
  {
    key: 'ecosystem',
    title: 'Ecosystem public assets',
    description:
      'Reserved for /img/ecosystem/<ecosystem-id>/* directories in ecosystem packages.',
    assets: [],
    emptyState:
      'No ecosystem registries yet. Populate packages/ecosystem/*/public/img/ecosystem to surface them here.',
  },
  {
    key: 'app',
    title: 'App & tenant public assets',
    description:
      'Use /img/app/<app-or-tenant>/* within individual app public directories to register overrides.',
    assets: [],
    emptyState:
      'No app-level assets registered. Add branding to projects/*/public/img/app to list them.',
  },
]

const previewToneClass = (tone: PreviewTone = 'light') => {
  if (tone === 'dark') return 'dev-image-panel--dark'
  if (tone === 'checker') return 'dev-image-panel--checker'
  return 'dev-image-panel--light'
}

definePageMeta({
  layout: 'dev',
  alias: ['/dev/img'],
  nav: {
    key: 'dev-images',
    label: 'Images',
    icon: 'i-lucide-image',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 45,
  },
  title: 'Dev · Images',
  description: 'Inspect platform assets inherited from fireux-core.',
})
</script>

<style scoped>
.dev-image-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dev-image-chip {
  width: 80px;
  height: 80px;
  border-radius: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 0.75rem;
}

.dev-image-chip img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.dev-image-chip.dev-image-panel--dark img {
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.65));
}

.dev-image-chip.dev-image-panel--light {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.dev-image-chip.dev-image-panel--dark {
  background: #0f172a;
}

.dev-image-chip.dev-image-panel--checker {
  background-image: linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
    linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
    linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
}
</style>
